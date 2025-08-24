import { Module } from '@nestjs/common';
import { FollowsService } from './follow.service';
import { FollowsController } from './follow.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
