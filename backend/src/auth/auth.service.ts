// src/auth/auth.service.ts
import {
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private clientId: string;
  private region: string;
  private userPoolId: string;

  constructor(
    @Inject('COGNITO_CLIENT') private readonly cognito: CognitoIdentityProviderClient,
    private readonly cfg: ConfigService,
  ) {
    // fail fast if envs are missing so you don't get misleading 500s later
    this.clientId = this.cfg.get<string>('COGNITO_CLIENT_ID')!;
    this.region = this.cfg.get<string>('AWS_REGION')!;
    this.userPoolId = this.cfg.get<string>('COGNITO_USER_POOL_ID')!;
    if (!this.clientId || !this.region || !this.userPoolId) {
      throw new Error(
        `Missing Cognito envs. COGNITO_CLIENT_ID=${this.clientId ?? 'undefined'}, AWS_REGION=${this.region ?? 'undefined'}, COGNITO_USER_POOL_ID=${this.userPoolId ?? 'undefined'}`,
      );
    }
  }

  /** Your pool requires email as username. Enforce here for helpful errors. */
  private ensureEmail(value: string, fieldLabel = 'username') {
    // very simple email check; adjust if you want stricter validation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isEmail) {
      throw new BadRequestException(
        `This user pool requires email as the ${fieldLabel}. Provide a valid email.`,
      );
    }
  }

  /** Map common Cognito errors to clean HTTP errors */
  private mapCognitoError(e: any, fallbackMessage: string): never {
    const name = e?.name || e?.__type;
    const msg = e?.message || fallbackMessage;

    // Sign-up & code flows
    if (name === 'UsernameExistsException') throw new BadRequestException('User already exists');
    if (name === 'InvalidPasswordException') throw new BadRequestException(msg);
    if (name === 'CodeMismatchException') throw new BadRequestException('Invalid code');
    if (name === 'ExpiredCodeException') throw new BadRequestException('Code has expired');
    if (name === 'UserNotFoundException') throw new BadRequestException('User not found');
    if (name === 'InvalidParameterException') throw new BadRequestException(msg);
    if (name === 'TooManyRequestsException') throw new BadRequestException('Too many requests, please try again later');

    // Sign-in
    if (name === 'NotAuthorizedException') {
      // wrong password or user not confirmed, etc.
      throw new UnauthorizedException(msg);
    }
    if (name === 'UserNotConfirmedException') {
      throw new BadRequestException('User not confirmed. Use /auth/confirm or /auth/resend.');
    }

    // Refresh / token errors
    if (name === 'InvalidRefreshTokenException') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Default
    // eslint-disable-next-line no-console
    console.error('Cognito error:', e);
    throw new InternalServerErrorException(fallbackMessage);
  }

  /** SIGN UP — Username must be the email (pool requirement) */
  async signUp(email: string, password: string, displayUsername?: string) {
    this.ensureEmail(email, 'email');

    try {
      const out = await this.cognito.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: email, // important: pool expects email here
          Password: password,
          UserAttributes: [
            { Name: 'email', Value: email },
            ...(displayUsername ? [{ Name: 'preferred_username', Value: displayUsername }] : []),
          ],
        }),
      );
      return { userConfirmed: !!out.UserConfirmed, username: email };
    } catch (e: any) {
      this.mapCognitoError(e, 'Sign up failed');
    }
  }

  /** CONFIRM SIGN UP — pass email as username */
  async confirmSignUp(usernameEmail: string, code: string) {
    this.ensureEmail(usernameEmail, 'username');
    try {
      await this.cognito.send(
        new ConfirmSignUpCommand({
          ClientId: this.clientId,
          Username: usernameEmail,
          ConfirmationCode: code,
        }),
      );
      return { ok: true };
    } catch (e: any) {
      this.mapCognitoError(e, 'Confirm sign up failed');
    }
  }

  /** RESEND CONFIRM CODE — pass email as username */
  async resendCode(usernameEmail: string) {
    this.ensureEmail(usernameEmail, 'username');
    try {
      await this.cognito.send(
        new ResendConfirmationCodeCommand({
          ClientId: this.clientId,
          Username: usernameEmail,
        }),
      );
      return { ok: true };
    } catch (e: any) {
      this.mapCognitoError(e, 'Resend code failed');
    }
  }

  /** SIGN IN — pool expects email in USERNAME */
  async signIn(usernameEmail: string, password: string) {
    this.ensureEmail(usernameEmail, 'username');
    try {
      const out = await this.cognito.send(
        new InitiateAuthCommand({
          ClientId: this.clientId,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: { USERNAME: usernameEmail, PASSWORD: password },
        }),
      );
      if (!out.AuthenticationResult) throw new UnauthorizedException('Auth failed');

      const { AccessToken, IdToken, RefreshToken, ExpiresIn, TokenType } = out.AuthenticationResult;
      return {
        accessToken: AccessToken!,
        idToken: IdToken!,
        refreshToken: RefreshToken,
        expiresIn: ExpiresIn!,
        tokenType: TokenType!,
      };
    } catch (e: any) {
      this.mapCognitoError(e, 'Sign in failed');
    }
  }

  /** REFRESH ACCESS TOKEN */
  async refresh(refreshToken: string) {
    try {
      const out = await this.cognito.send(
        new InitiateAuthCommand({
          ClientId: this.clientId,
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: { REFRESH_TOKEN: refreshToken },
        }),
      );
      if (!out.AuthenticationResult) throw new UnauthorizedException('Refresh failed');

      const { AccessToken, IdToken, ExpiresIn, TokenType } = out.AuthenticationResult;
      return {
        accessToken: AccessToken!,
        idToken: IdToken!,
        expiresIn: ExpiresIn!,
        tokenType: TokenType!,
      };
    } catch (e: any) {
      this.mapCognitoError(e, 'Token refresh failed');
    }
  }

  /** FORGOT PASSWORD — send code */
  async forgot(usernameEmail: string) {
    this.ensureEmail(usernameEmail, 'username');
    try {
      await this.cognito.send(
        new ForgotPasswordCommand({ ClientId: this.clientId, Username: usernameEmail }),
      );
      return { ok: true }; // code sent via pool channel (email/SMS)
    } catch (e: any) {
      this.mapCognitoError(e, 'Forgot password failed');
    }
  }

  /** RESET PASSWORD — confirm code + new password */
  async reset(usernameEmail: string, code: string, newPassword: string) {
    this.ensureEmail(usernameEmail, 'username');
    try {
      await this.cognito.send(
        new ConfirmForgotPasswordCommand({
          ClientId: this.clientId,
          Username: usernameEmail,
          ConfirmationCode: code,
          Password: newPassword,
        }),
      );
      return { ok: true };
    } catch (e: any) {
      this.mapCognitoError(e, 'Reset password failed');
    }
  }

  /** CHANGE PASSWORD — requires Bearer access token from signin */
  async changePassword(accessToken: string, currentPassword: string, newPassword: string) {
    if (!accessToken) throw new BadRequestException('Missing access token');
    try {
      await this.cognito.send(
        new ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword,
        }),
      );
      return { ok: true };
    } catch (e: any) {
      this.mapCognitoError(e, 'Change password failed');
    }
  }

  /** GLOBAL SIGN OUT — invalidate tokens */
  async signOut(accessToken: string) {
    if (!accessToken) throw new BadRequestException('Missing access token');
    try {
      await this.cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
      return { ok: true };
    } catch (e: any) {
      this.mapCognitoError(e, 'Sign out failed');
    }
  }
}
