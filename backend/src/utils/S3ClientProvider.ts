import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const S3ClientProvider = {
  provide: S3Client,
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) => {
    const region = cfg.get<string>('AWS_REGION');
    if (!region) throw new Error('AWS_REGION is not set');
    // Credentials are read from env: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
    return new S3Client({ region });
  },
};
