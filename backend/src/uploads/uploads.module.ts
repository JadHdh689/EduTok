import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { S3ClientProvider } from '../utils/S3ClientProvider';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [UploadsController],
  providers: [UploadsService, S3ClientProvider],
  exports: [UploadsService],
})
export class UploadsModule {}
