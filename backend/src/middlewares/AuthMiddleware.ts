import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        username?: string;
        email?: string;
        tokenUse?: 'id' | 'access';
        payload: JWTPayload;
      }
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private issuer: string;
  private clientId: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    const poolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    this.clientId = this.config.get<string>('COGNITO_CLIENT_ID')!;
    this.issuer =
      this.config.get<string>('COGNITO_ISSUER') ??
      `https://cognito-idp.${region}.amazonaws.com/${poolId}`;

    const jwksUrl = new URL(`${this.issuer}/.well-known/jwks.json`);
    this.jwks = createRemoteJWKSet(jwksUrl);
  }

  async use(req: any, _res: any, next: () => void) {
    const header = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.clientId,
      });

      const sub = String(payload.sub ?? '');
      if (!sub) throw new UnauthorizedException('Invalid token (no sub)');

      req.auth = {
        sub,
        username: (payload['cognito:username'] as string) ?? (payload['username'] as string),
        email: (payload['email'] as string | undefined),
        tokenUse: (payload['token_use'] as any) ?? 'access',
        payload,
      };

      next();
    } catch (err: any) {
      throw new UnauthorizedException(`Invalid token: ${err?.message ?? 'verification failed'}`);
    }
  }
}
