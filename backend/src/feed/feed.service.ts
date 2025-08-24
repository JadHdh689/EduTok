// src/feed/feed.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  // General FYP: infinite scroll, prefer user prefs, avoid repeats
  async general(
    authSub: string,
    take = 10,
    after?: { createdAt: string; id: string }, // pass last item boundary (ISO date + id) from client
  ) {
    const me = await this.prisma.user.findUnique({
      where: { authSub },
      include: { prefs: true },
    });
    if (!me) throw new Error('User not found');

    const preferredCatIds = me.prefs.map((p) => p.categoryId);

    const seen = await this.prisma.userVideoSeen.findMany({
      where: { userId: me.id },
      select: { videoId: true },
    });
    const seenIds = new Set(seen.map((s) => s.videoId));

    const where: any = {
      visibility: 'PUBLIC',
      ...(preferredCatIds.length ? { categoryId: { in: preferredCatIds } } : {}),
    };

    // “After” pagination using createdAt,id boundary
    if (after?.createdAt && after?.id) {
      const afterDate = new Date(after.createdAt);
      where.OR = [
        { createdAt: { lt: afterDate } },
        { AND: [{ createdAt: afterDate }, { id: { lt: after.id } }] },
      ];
    }

    const page = await this.prisma.video.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    // Try not to repeat (filter out seen)
    const filtered = page.filter((v) => !seenIds.has(v.id));
    return filtered;
  }

  // Following FYP: only from followed users (simple offset pagination)
  async following(authSub: string, take = 10, page = 0) {
    const me = await this.prisma.user.findUnique({
      where: { authSub },
      include: { followsOut: true },
    });
    const followeeIds = me?.followsOut.map((f) => f.followeeId) ?? [];
    if (!followeeIds.length) return [];

    return this.prisma.video.findMany({
      where: { authorId: { in: followeeIds }, visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take,
      skip: page * take,
    });
  }

  // Course discovery: simple text search
  searchCourses(q: string, take = 10, page = 0) {
    return this.prisma.course.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip: page * take,
    });
  }
}
