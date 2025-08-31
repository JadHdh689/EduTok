import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class UploadsService {
  private bucket: string;

  constructor(
    private readonly cfg: ConfigService,
    private readonly s3: S3Client,        // <-- resolved by S3ClientProvider
  ) {
    this.bucket = this.cfg.get<string>('S3_BUCKET')!;
    if (!this.bucket) throw new Error('S3_BUCKET is not set');
  }

  async presign(fileName: string, contentType: string, kind: string) {
    // Basic guardrails
    const safeName = fileName.replace(/[^\w.\-]/g, '_');
    if (!contentType.includes('/')) {
      throw new BadRequestException('Invalid contentType');
    }

    // Folder by kind + date, unique key
    const date = new Date();
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');

    const key = `${kind}/${yyyy}/${mm}/${dd}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;

    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 150 * 1024 * 1024], // 150MB max
        ['starts-with', '$Content-Type', contentType.split('/')[0]], // basic prefix check
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 60, // seconds to start the upload
    });

    return { url, fields, key };
  }
}
