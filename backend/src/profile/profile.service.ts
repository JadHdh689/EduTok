//src/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getMe(authSub: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    return me;
  }

  async updateMe(
    authSub: string,
    data: { displayName?: string; bio?: string; avatarUrl?: string },
  ) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: me.id },
      data: {
        displayName: data.displayName ?? undefined,
        bio: data.bio ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
      },
    });
  }

  async listMyVideos(authSub: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');

    return this.prisma.video.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async listMyCourses(authSub: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');

    return this.prisma.course.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
