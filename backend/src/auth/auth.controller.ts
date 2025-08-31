import { Body, Controller, Headers, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';
import { ResendCodeDto } from './dto/resend.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotDto } from './dto/forgot.dto';
import { ResetDto } from './dto/reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.auth.signUp(dto.email, dto.password, dto.username);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmSignUpDto) {
    return this.auth.confirmSignUp(dto.username, dto.code);
  }

  @Post('resend')
  resend(@Body() dto: ResendCodeDto) {
    return this.auth.resendCode(dto.username);
  }

  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.auth.signIn(dto.username, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('forgot')
  forgot(@Body() dto: ForgotDto) {
    return this.auth.forgot(dto.username);
  }

  @Post('reset')
  reset(@Body() dto: ResetDto) {
    return this.auth.reset(dto.username, dto.code, dto.newPassword);
  }

  @Post('change-password')
  changePassword(@Headers('authorization') authz: string | undefined, @Body() dto: ChangePasswordDto) {
    const token = (authz || '').startsWith('Bearer ') ? authz!.slice(7) : '';
    return this.auth.changePassword(token, dto.currentPassword, dto.newPassword);
  }

  @Post('signout')
  signOut(@Headers('authorization') authz: string | undefined) {
    const token = (authz || '').startsWith('Bearer ') ? authz!.slice(7) : '';
    return this.auth.signOut(token);
  }
}
