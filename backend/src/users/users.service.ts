// src/users/users.service.ts
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('COGNITO_CLIENT') private readonly cognito: CognitoIdentityProviderClient,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByAuthSub(authSub: string) {
    return this.prisma.user.findUnique({ where: { authSub } });
  }

  /**
   * Preferred for /users/me:
   * - Upserts a local user row from token claims
   * - If email is missing (access token), call Cognito GetUser to enrich it
   * - DOES NOT overwrite displayName on subsequent logins
   */
  async upsertFromTokenSmart(auth: {
    sub: string;
    email?: string;
    username?: string;
    accessToken?: string;
  }) {
    let { sub, email, username, accessToken } = auth;

    // If email isn't in the token (typical for access tokens), try Cognito GetUser
    if (!email && accessToken) {
      try {
        const out = await this.cognito.send(new GetUserCommand({ AccessToken: accessToken }));
        const attrs = Object.fromEntries(
          (out.UserAttributes ?? []).map((a) => [a.Name!, a.Value!]),
        );
        email = attrs.email ?? email;
      } catch (e: any) {
        this.logger.warn(
          `GetUser failed while enriching email for sub=${sub}: ${e?.name || e?.message || e}`,
        );
      }
    }

    const initialDisplay = username ?? (email ? email.split('@')[0] : 'User');
    const initialUsername = username ?? `user_${sub.slice(0, 6)}`;

    return this.prisma.user.upsert({
      where: { authSub: sub },
      update: {
        // Only update email on subsequent logins; don't clobber displayName each time
        email: email ?? undefined,
      },
      create: {
        authSub: sub,
        username: initialUsername,
        displayName: initialDisplay,
        email: email ?? null,
      } satisfies Prisma.UserCreateInput,
    });
  }

  /**
   * Legacy/simple upsert (kept for compatibility).
   * Modified to avoid overwriting displayName on update.
   */
  async upsertFromToken(auth: { sub: string; email?: string; username?: string }) {
    const { sub, email, username } = auth;
    return this.prisma.user.upsert({
      where: { authSub: sub },
      update: {
        email: email ?? undefined, // don't overwrite displayName
      },
      create: {
        authSub: sub,
        username: username ?? `user_${sub.slice(0, 6)}`,
        displayName: username ?? 'User',
        email: email ?? null,
      } satisfies Prisma.UserCreateInput,
    });
  }

  // ===== Self profile update =====
  async updateProfile(
    userId: string,
    data: { displayName?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  // ===== Admin CRUD =====

  async listUsers(params?: { q?: string; take?: number; skip?: number }) {
    const q = params?.q?.trim();
    const where: Prisma.UserWhereInput | undefined = q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params?.take ?? 20,
      skip: params?.skip ?? 0,
    });
  }

  async adminGetById(id: string) {
    return this.findById(id);
  }

  async adminUpdate(id: string, data: {
    displayName?: string; bio?: string; avatarUrl?: string; role?: 'USER' | 'ADMIN'
  }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        role: data.role,
      },
    });
  }

  async deleteSelf(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async adminDelete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
