// src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [ConfigModule], // so we can read AWS_REGION, etc.
  controllers: [UploadsController],
  providers: [
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new S3Client({
          region: cfg.get<string>('AWS_REGION'),
          // If you set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in .env,
          // the SDK picks them up automatically. Otherwise you can pass credentials here.
        }),
    },
    UploadsService,
  ],
  exports: [
    S3Client,       // <-- make S3 client available to other modules
    UploadsService, // (optional, handy)
  ],
})
export class UploadsModule {}
