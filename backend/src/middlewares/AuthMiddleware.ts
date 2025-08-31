// src/middlewares/AuthMiddleware.ts
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
  // allow unauthenticated access to /auth/*
  const url = (req.originalUrl || req.url || '') as string;
  if (url.startsWith('/auth')) return next();

  const header = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing Bearer token');
  }
  const token = header.slice('Bearer '.length).trim();

  try {
    // Verify signature & issuer only; do audience checks manually per token type
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      // NOTE: don't set 'audience' here—ID vs Access tokens differ.
    });

    const tokenUse = payload['token_use'] as 'id' | 'access' | undefined;
    const aud = payload['aud'] as string | undefined;           // ID token claim
    const clientId = payload['client_id'] as string | undefined; // Access token claim
    const sub = String(payload['sub'] ?? '');

    if (!sub) throw new UnauthorizedException('Invalid token (no sub)');

    // Enforce client binding depending on token type
    if (tokenUse === 'id') {
      if (aud !== this.clientId) throw new UnauthorizedException('Invalid token (aud mismatch)');
    } else if (tokenUse === 'access') {
      if (clientId !== this.clientId) throw new UnauthorizedException('Invalid token (client_id mismatch)');
    } else {
      // Some tokens may omit token_use; fall back to either claim
      if (!(aud === this.clientId || clientId === this.clientId)) {
        throw new UnauthorizedException('Invalid token (unrecognized token_use)');
      }
    }

    req.auth = {
      sub,
      // prefer human-friendly name if present
      username:
        (payload['preferred_username'] as string) ??
        (payload['cognito:username'] as string) ??
        (payload['username'] as string),
      email: (payload['email'] as string | undefined),
      tokenUse: (tokenUse ?? 'access') as 'id' | 'access',
      payload,
    };

    next();
  } catch (err: any) {
    throw new UnauthorizedException(`Invalid token: ${err?.message ?? 'verification failed'}`);
  }
}
}
