// src/follow/follow.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(authSub: string, targetUserId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    if (me.id === targetUserId) throw new BadRequestException('Cannot follow yourself');

    await this.prisma.follow.create({
      data: { followerId: me.id, followeeId: targetUserId },
    });
    return { ok: true };
  }

  async unfollow(authSub: string, targetUserId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    await this.prisma.follow.delete({
      where: { followerId_followeeId: { followerId: me.id, followeeId: targetUserId } },
    });
    return { ok: true };
  }
}
