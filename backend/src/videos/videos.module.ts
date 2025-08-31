// src/videos/videos.module.ts
import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module'; // <-- add
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [PrismaModule, UploadsModule, AwsModule], // <-- add UploadsModule so S3Client is visible
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
