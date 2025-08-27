import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from '../guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // CREATE/READ current user (implicit create via upsert)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.users.upsertFromToken({
      sub: req.auth.sub,
      email: req.auth.email,
      username: req.auth.username,
    });
    return user;
  }

  // UPDATE self
  @Patch()
  async update(@Req() req: any, @Body() body: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const dbUser = await this.users.findByAuthSub(req.auth.sub);
    return this.users.updateProfile(dbUser!.id, body);
  }

  // DELETE self
  @Delete('me')
  async deleteMe(@Req() req: any) {
    const dbUser = await this.users.findByAuthSub(req.auth.sub);
    return this.users.deleteSelf(dbUser!.id);
  }

  // ===== Admin endpoints =====

  // LIST / SEARCH users (admin)
  @Get()
  @UseGuards(AdminGuard)
  async list(@Query('q') q?: string, @Query('take') take?: string, @Query('skip') skip?: string) {
    return this.users.listUsers({
      q,
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  // GET by id (admin)
  @Get(':id')
  @UseGuards(AdminGuard)
  async adminGet(@Param('id') id: string) {
    return this.users.adminGetById(id);
  }

  // UPDATE by id (admin)
  @Patch(':id')
  @UseGuards(AdminGuard)
  async adminUpdate(
    @Param('id') id: string,
    @Body() body: { displayName?: string; bio?: string; avatarUrl?: string; role?: 'USER'|'ADMIN' },
  ) {
    return this.users.adminUpdate(id, body);
  }

  // DELETE by id (admin)
  @Delete(':id')
  @UseGuards(AdminGuard)
  async adminDelete(@Param('id') id: string) {
    return this.users.adminDelete(id);
  }
}
