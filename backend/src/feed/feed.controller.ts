// src/feed/feed.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get('general')
  general(
    @Req() req: any,
    @Query('take') take?: string,
    @Query('afterCreatedAt') afterCreatedAt?: string,
    @Query('afterId') afterId?: string,
  ) {
    const after = afterCreatedAt && afterId ? { createdAt: afterCreatedAt, id: afterId } : undefined;
    return this.feed.general(req.auth.sub, take ? parseInt(take) : 10, after);
  }

  @Get('following')
  following(@Req() req: any, @Query('take') take?: string, @Query('page') page?: string) {
    return this.feed.following(req.auth.sub, take ? parseInt(take) : 10, page ? parseInt(page) : 0);
  }

  @Get('courses')
  courses(@Query('q') q = '', @Query('take') take?: string, @Query('page') page?: string) {
    return this.feed.searchCourses(q, take ? parseInt(take) : 10, page ? parseInt(page) : 0);
  }
}
