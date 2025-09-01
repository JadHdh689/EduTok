// src/feed/feed.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  // GET /feed/next?categoryId=12&exclude=prevVideoId
  @Get('next')
  async next(
    @Req() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('exclude') exclude?: string,
  ) {
    let catId: number | undefined;
    if (typeof categoryId === 'string' && categoryId.trim() !== '') {
      const n = Number(categoryId);
      if (Number.isFinite(n)) catId = n;
    }
    return this.feed.next(req.auth?.sub, catId, exclude || undefined);
  }
}
