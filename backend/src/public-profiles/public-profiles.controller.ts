// src/profiles/public-profiles.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';



@Controller('profiles')
export class PublicProfilesController {
  constructor(private prisma: PrismaService) {}

  @Get(':username')
  async publicProfile(@Param('username') username: string, @Query('take') take?: string, @Query('skip') skip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true, createdAt: true },
    });
    if (!user) return { user: null, videos: [], courses: [] };

    const t = take ? +take : 12;
    const s = skip ? +skip : 0;

    const [videos, courses] = await Promise.all([
      this.prisma.video.findMany({
        where: { authorId: user.id, visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' }, take: t, skip: s,
        select: {
          id: true, title: true, description: true, durationSec: true, createdAt: true,
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.course.findMany({
        where: { authorId: user.id, published: true },
        orderBy: { createdAt: 'desc' }, take: t, skip: 0,
        select: { id: true, title: true, description: true, coverImageUrl: true, createdAt: true },
      }),
    ]);

    return { user, videos, courses };
  }
}
