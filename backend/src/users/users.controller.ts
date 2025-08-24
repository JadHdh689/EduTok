import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    const user = await this.users.upsertFromToken({
      sub: req.auth.sub,
      email: req.auth.email,
      username: req.auth.username,
    });
    return user;
  }

  @Patch()
  async update(@Req() req: any, @Body() body: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const dbUser = await this.users.findByAuthSub(req.auth.sub);
    return this.users.updateProfile(dbUser!.id, body);
  }
}
