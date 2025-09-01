// src/feed/feed.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  private readonly videoSelect = {
    id: true,
    title: true,
    description: true,
    durationSec: true,
    s3Bucket: true,
    s3Key: true,
    createdAt: true,
    category: { select: { id: true, name: true } },
    author: {
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    },
  } as const;

  /**
   * If categoryId is provided:
   *  - pick a random unseen PUBLIC video in that category
   *  - if none, recycle the least-recently-seen video **in that category**
   *  - if still none, 404
   * If no categoryId:
   *  - original behavior (unseen → recycle oldest → any PUBLIC)
   */
  async next(authSub?: string, categoryId?: number, excludeId?: string) {
    const me = authSub
      ? await this.prisma.user.findUnique({ where: { authSub } })
      : null;

    // Build exclude IDs: (already seen) + (explicit exclude)
    const excludeIds: string[] = [];
    if (excludeId) excludeIds.push(excludeId);

    if (me) {
      const seen = await this.prisma.userVideoSeen.findMany({
        where: { userId: me.id },
        select: { videoId: true },
      });
      for (const s of seen) excludeIds.push(s.videoId);
    }

    const whereBase = (cat?: number): Prisma.VideoWhereInput => ({
      visibility: Visibility.PUBLIC,
      ...(typeof cat === 'number' ? { categoryId: cat } : {}),
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    });

    let v: any = null;

    if (typeof categoryId === 'number') {
      // STRICT: only this category
      v = await this.randomPick(whereBase(categoryId));

      // recycle within the same category
      if (!v && me) {
        const seenOldestInCat = await this.prisma.userVideoSeen.findFirst({
          where: {
            userId: me.id,
            video: { visibility: Visibility.PUBLIC, categoryId: categoryId },
          },
          orderBy: { seenAt: 'asc' },
          select: { video: { select: this.videoSelect } },
        });
        v = seenOldestInCat?.video || null;
      }

      if (!v) {
        throw new NotFoundException('No videos available in this category');
      }
    } else {
      // No category filter → original behavior
      v = await this.randomPick(whereBase(undefined));

      if (!v && me) {
        const seenOldest = await this.prisma.userVideoSeen.findFirst({
          where: { userId: me.id },
          orderBy: { seenAt: 'asc' },
          select: { video: { select: this.videoSelect } },
        });
        v = seenOldest?.video || null;
      }

      if (!v) v = await this.randomPick({ visibility: Visibility.PUBLIC });
      if (!v) throw new NotFoundException('No videos available');
    }

    return {
      id: v.id,
      title: v.title,
      description: v.description,
      durationSec: v.durationSec,
      category: v.category ? { id: v.category.id, name: v.category.name } : null,
      author: v.author
        ? {
            id: v.author.id,
            username: v.author.username,
            displayName: v.author.displayName,
            avatarUrl: v.author.avatarUrl,
          }
        : null,
    };
  }

  private async randomPick(where: Prisma.VideoWhereInput) {
    const total = await this.prisma.video.count({ where });
    if (!total) return null;
    const skip = Math.floor(Math.random() * total);
    const rows = await this.prisma.video.findMany({
      where,
      skip,
      take: 1,
      select: this.videoSelect,
    });
    return rows[0] ?? null;
  }
}
