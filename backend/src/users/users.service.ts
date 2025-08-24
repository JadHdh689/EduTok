import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByAuthSub(authSub: string) {
    return this.prisma.user.findUnique({ where: { authSub } });
  }

  async upsertFromToken(auth: { sub: string; email?: string; username?: string }) {
    const { sub, email, username } = auth;
    return this.prisma.user.upsert({
      where: { authSub: sub },
      update: {
        email: email ?? undefined,
        displayName: username ?? undefined,
      },
      create: {
        authSub: sub,
        username: (username ?? `user_${sub.slice(0, 6)}`),
        displayName: (username ?? 'User'),
        email: email ?? null,
      } satisfies Prisma.UserCreateInput,
    });
  }

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      },
    });
  }
}
