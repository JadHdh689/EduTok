// FILE: src/aws/aws.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Client,
      useFactory: (cfg: ConfigService) =>
        new S3Client({ region: cfg.get<string>('AWS_REGION') }),
      inject: [ConfigService],
    },
  ],
  exports: [S3Client],
})
export class AwsModule {}
