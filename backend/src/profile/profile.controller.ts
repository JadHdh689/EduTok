// src/profile/profile.controller.ts:
import { Body, Controller, Get, Patch, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.profile.getMe(req.auth.sub);
  }

  @Patch('me')
  updateMe(
    @Req() req: any,
    @Body() body: { displayName?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.profile.updateMe(req.auth.sub, body);
  }

  @Get('videos')
  myVideos(@Req() req: any) {
    return this.profile.listMyVideos(req.auth.sub);
  }

  @Get('courses')
  myCourses(@Req() req: any) {
    return this.profile.listMyCourses(req.auth.sub);
  }
}
