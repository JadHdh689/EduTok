// src/feed/feed.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Return ONE next video by:
   *  - applying categoryId filter if provided (or "All" if not)
   *  - excluding anything the user has already seen
   *  - choosing a random unseen video
   * Fallbacks:
   *  - if none in the category -> try "All"
   *  - if still none -> least-recently-seen (recycle)
   *  - if still none -> any random PUBLIC video
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
      ...(cat ? { categoryId: cat } : {}),
      ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
    });

    // 1) Try unseen in requested category (or All if no cat)
    let v = await this.randomPick(whereBase(categoryId));

    // 2) If category was specified but empty, try "All"
    if (!v && categoryId) v = await this.randomPick(whereBase(undefined));

    // 3) Recycle least-recently-seen
    if (!v && me) {
      const seenOldest = await this.prisma.userVideoSeen.findFirst({
        where: { userId: me.id },
        orderBy: { seenAt: 'asc' }, // NOTE: your model uses seenAt
        select: {
          video: {
            select: {
              id: true,
              title: true,
              description: true,
              durationSec: true,
              s3Bucket: true,
              s3Key: true,
              createdAt: true,
              category: { select: { id: true, name: true } },
              author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      });
      v = seenOldest?.video || null;
    }

    // 4) Last resort: any random PUBLIC video
    if (!v) v = await this.randomPick({ visibility: Visibility.PUBLIC });

    if (!v) throw new NotFoundException('No videos available');

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

  // Pick ONE random row matching "where"
  private async randomPick(where: Prisma.VideoWhereInput) {
    const total = await this.prisma.video.count({ where });
    if (!total) return null;
    const skip = Math.floor(Math.random() * total);
    const rows = await this.prisma.video.findMany({
      where,
      skip,
      take: 1,
      select: {
        id: true,
        title: true,
        description: true,
        durationSec: true,
        s3Bucket: true,
        s3Key: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
    return rows[0] ?? null;
  }
}
