// src/follow/follow.controller.ts
import { Body, Controller, Delete, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { FollowsService } from './follow.service';
import { FollowDto } from './dto/follow.dto';

@Controller('follows')
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  follow(@Req() req: any, @Body() dto: FollowDto) {
    return this.follows.follow(req.auth.sub, dto.userId);
  }

  @Delete()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  unfollow(@Req() req: any, @Body() dto: FollowDto) {
    return this.follows.unfollow(req.auth.sub, dto.userId);
  }
}
