// src/guards/admin.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<any>();
    if (!req?.auth?.sub) throw new ForbiddenException('No auth');
    const me = await this.prisma.user.findUnique({ where: { authSub: req.auth.sub } });
    if (!me || me.role !== 'ADMIN') throw new ForbiddenException('Admin only');
    return true;
  }
}
