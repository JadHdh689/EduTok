import { Controller, Get, Param, Query, Req, Post, Delete } from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('profiles')
export class PublicProfilesController {
  constructor(private prisma: PrismaService) {}

  /** Public people search */
  @Get('search')
  async search(
    @Query('q') q?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Req() req?: any,
  ) {
    const viewerSub = req?.auth?.sub ?? null;
    const where: Prisma.UserWhereInput | undefined = q?.trim()
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const t = take ? +take : 20;
    const s = skip ? +skip : 0;

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [{ displayName: 'asc' }, { username: 'asc' }],
      take: t,
      skip: s,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: { followsIn: true, followsOut: true },
        },
      },
    });

    // isFollowing for viewer
    let viewerId: string | null = null;
    if (viewerSub) {
      const v = await this.prisma.user.findUnique({ where: { authSub: viewerSub }, select: { id: true } });
      viewerId = v?.id ?? null;
    }
    const followEdges = viewerId
      ? await this.prisma.follow.findMany({
          where: { followerId: viewerId, followeeId: { in: users.map(u => u.id) } },
          select: { followeeId: true },
        })
      : [];
    const followingSet = new Set(followEdges.map(f => f.followeeId));

    return users.map(u => ({
      ...u,
      stats: { followers: u._count.followsIn, following: u._count.followsOut },
      isFollowing: viewerId ? followingSet.has(u.id) : false,
    }));
  }

  /** Public profile (videos + courses + follow stats + isFollowing) */
  @Get(':username')
  async publicProfile(
    @Req() req: any,
    @Param('username') username: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const viewerSub = req?.auth?.sub ?? null;

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!user) {
      return {
        user: null,
        videos: [],
        courses: [],
        stats: { followers: 0, following: 0 },
        isMe: false,
        isFollowing: false,
      };
    }

    const t = take ? +take : 12;
    const s = skip ? +skip : 0;

    const [followers, following, videos, courses, viewer, followEdge] = await Promise.all([
      this.prisma.follow.count({ where: { followeeId: user.id } }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
      this.prisma.video.findMany({
        where: { authorId: user.id, visibility: Visibility.PUBLIC },
        orderBy: { createdAt: 'desc' },
        take: t,
        skip: s,
        select: {
          id: true,
          title: true,
          description: true,
          durationSec: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.course.findMany({
        where: { authorId: user.id, published: true },
        orderBy: { createdAt: 'desc' },
        take: t,
        skip: 0,
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
      }),
      viewerSub ? this.prisma.user.findUnique({ where: { authSub: viewerSub }, select: { id: true } }) : null,
      viewerSub
        ? this.prisma.follow.findFirst({
            where: { follower: { authSub: viewerSub }, followeeId: user.id },
            select: { id: true },
          })
        : null,
    ]);

    return {
      user,
      videos,
      courses,
      stats: { followers, following, videos: videos.length, courses: courses.length },
      isMe: !!viewer && viewer.id === user.id,
      isFollowing: !!followEdge,
    };
  }

  /** Followers list */
  @Get(':username/followers')
  async followers(
    @Req() req: any,
    @Param('username') username: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const viewerSub = req?.auth?.sub ?? null;
    const t = take ? +take : 20;
    const s = skip ? +skip : 0;

    const owner = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!owner) return [];

    const rows = await this.prisma.follow.findMany({
      where: { followeeId: owner.id },
      orderBy: { createdAt: 'desc' },
      take: t,
      skip: s,
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            _count: { select: { followsIn: true, followsOut: true } },
          },
        },
      },
    });
    const users = rows.map(r => r.follower);

    // compute isFollowing relative to viewer
    let viewerId: string | null = null;
    if (viewerSub) {
      const v = await this.prisma.user.findUnique({ where: { authSub: viewerSub }, select: { id: true } });
      viewerId = v?.id ?? null;
    }
    const edges = viewerId
      ? await this.prisma.follow.findMany({
          where: { followerId: viewerId, followeeId: { in: users.map(u => u.id) } },
          select: { followeeId: true },
        })
      : [];
    const set = new Set(edges.map(e => e.followeeId));

    return users.map(u => ({
      ...u,
      stats: { followers: u._count.followsIn, following: u._count.followsOut },
      isFollowing: viewerId ? set.has(u.id) : false,
    }));
  }

  /** Following list */
  @Get(':username/following')
  async following(
    @Req() req: any,
    @Param('username') username: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const viewerSub = req?.auth?.sub ?? null;
    const t = take ? +take : 20;
    const s = skip ? +skip : 0;

    const owner = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!owner) return [];

    const rows = await this.prisma.follow.findMany({
      where: { followerId: owner.id },
      orderBy: { createdAt: 'desc' },
      take: t,
      skip: s,
      select: {
        followee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            _count: { select: { followsIn: true, followsOut: true } },
          },
        },
      },
    });
    const users = rows.map(r => r.followee);

    let viewerId: string | null = null;
    if (viewerSub) {
      const v = await this.prisma.user.findUnique({ where: { authSub: viewerSub }, select: { id: true } });
      viewerId = v?.id ?? null;
    }
    const edges = viewerId
      ? await this.prisma.follow.findMany({
          where: { followerId: viewerId, followeeId: { in: users.map(u => u.id) } },
          select: { followeeId: true },
        })
      : [];
    const set = new Set(edges.map(e => e.followeeId));

    return users.map(u => ({
      ...u,
      stats: { followers: u._count.followsIn, following: u._count.followsOut },
      isFollowing: viewerId ? set.has(u.id) : false,
    }));
  }

  /** Follow a user by username (auth required) */
  @Post(':username/follow')
  async follow(@Req() req: any, @Param('username') username: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub: req.auth.sub } });
    if (!me) throw new Error('User not found');

    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw new Error('Target user not found');
    if (target.id === me.id) throw new Error('Cannot follow yourself');

    await this.prisma.follow.upsert({
      where: { followerId_followeeId: { followerId: me.id, followeeId: target.id } },
      update: {},
      create: { followerId: me.id, followeeId: target.id },
    });
    const followers = await this.prisma.follow.count({ where: { followeeId: target.id } });
    return { ok: true, isFollowing: true, followers };
  }

  /** Unfollow */
  @Delete(':username/follow')
  async unfollow(@Req() req: any, @Param('username') username: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub: req.auth.sub } });
    if (!me) throw new Error('User not found');

    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw new Error('Target user not found');

    await this.prisma.follow.deleteMany({ where: { followerId: me.id, followeeId: target.id } });
    const followers = await this.prisma.follow.count({ where: { followeeId: target.id } });
    return { ok: true, isFollowing: false, followers };
  }
}
