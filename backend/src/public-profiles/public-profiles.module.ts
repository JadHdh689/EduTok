// src/profiles/public-profiles.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PublicProfilesController } from './public-profiles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PublicProfilesController],
})
export class PublicProfilesModule {}
