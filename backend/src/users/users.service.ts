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

  // CREATE via Cognito token (implicit)
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

  // UPDATE (self)
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

  // ===== Admin CRUD =====

  // list/search
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


  // admin read by id
  async adminGetById(id: string) {
    return this.findById(id);
  }

  // admin update (role, display, etc.)
  async adminUpdate(id: string, data: { displayName?: string; bio?: string; avatarUrl?: string; role?: 'USER'|'ADMIN' }) {
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

  // delete self
  async deleteSelf(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // admin delete
  async adminDelete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
