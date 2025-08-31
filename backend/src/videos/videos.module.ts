import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [PrismaModule, UploadsModule, AwsModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
