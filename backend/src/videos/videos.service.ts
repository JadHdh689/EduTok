// src/videos/videos.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Visibility } from '@prisma/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject } from '@nestjs/common'

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService, @Inject(S3Client) private s3: S3Client) {}
async create(authorAuthSub: string, dto: CreateVideoDto) {
    if (dto.durationSec > 90) throw new BadRequestException('Video must be ≤ 90 seconds');

    // Ensure exactly one correct option per question
    for (const q of dto.quiz) {
      const correctCount = q.options.filter((o) => o.isCorrect === true).length;
      if (correctCount !== 1) {
        throw new BadRequestException('Each question must have exactly one correct option');
      }
    }

    const author = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
    if (!author) throw new NotFoundException('User not found');

    return this.prisma.$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          authorId: author.id,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description ?? null,
          durationSec: dto.durationSec,
          visibility: Visibility.PUBLIC,
          s3Bucket: process.env.S3_BUCKET as string,
          s3Key: dto.s3Key,
        },
      });

      const quiz = await tx.quiz.create({
        data: {
          title: `${dto.title} — Quiz`,
          videoId: video.id,
          passScore: null,
        },
      });

      for (let qi = 0; qi < dto.quiz.length; qi++) {
        const q = dto.quiz[qi];
        const question = await tx.quizQuestion.create({
          data: { quizId: quiz.id, order: qi + 1, text: q.text },
        });
        for (const opt of q.options) {
          await tx.quizOption.create({
            data: { questionId: question.id, text: opt.text, isCorrect: !!opt.isCorrect },
          });
        }
      }

      return { videoId: video.id };
    });
  }


  async getById(id: string, authSub: string) {
    // Also mark as seen for general feed anti-repeat
    const user = await this.prisma.user.findUnique({ where: { authSub } });
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    if (!video) throw new NotFoundException('Video not found');

    if (user) {
      await this.prisma.userVideoSeen.upsert({
        where: { userId_videoId: { userId: user.id, videoId: video.id } },
        update: {},
        create: { userId: user.id, videoId: video.id },
      });
    }

    return video;
  }
   
  // inside VideosService class

async listMine(authorAuthSub: string, take = 20, skip = 0) {
  const me = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
  if (!me) throw new NotFoundException('User not found');
  return this.prisma.video.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: 'desc' },
    take, skip,
  });
}

async deleteOwn(authorAuthSub: string, videoId: string) {
  const me = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
  if (!me) throw new NotFoundException('User not found');

  const v = await this.prisma.video.findUnique({ where: { id: videoId } });
  if (!v) throw new NotFoundException('Video not found');
  if (v.authorId !== me.id) throw new BadRequestException('Not your video');

  // Optional: also delete the S3 object if you want (needs s3:DeleteObject permission).
  // For safety, people often keep uploads even if the DB row is deleted.

  await this.prisma.video.delete({ where: { id: videoId } });
  return { ok: true };
}
async getStreamUrlById(videoId: string, authSub: string) {
  const me = await this.prisma.user.findUnique({ where: { authSub } });
  const v = await this.prisma.video.findUnique({ where: { id: videoId } });
  if (!v) throw new NotFoundException('Video not found');

  // Example rule: allow anyone since visibility is PUBLIC; otherwise ensure v.authorId === me?.id
  // if (v.visibility !== 'PUBLIC' && v.authorId !== me?.id) throw new BadRequestException('Forbidden');

  const cmd = new GetObjectCommand({ Bucket: v.s3Bucket, Key: v.s3Key });
  const url = await getSignedUrl(this.s3 as any, cmd, { expiresIn: 900 });
  return { url };
}
  async getStreamUrl(authSub: string | undefined, videoId: string, expiresIn = 900) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    // Optional: authorize — allow author or PUBLIC visibility
    if (video.visibility !== 'PUBLIC') {
      const me = authSub ? await this.prisma.user.findUnique({ where: { authSub } }) : null;
      if (!me || me.id !== video.authorId) {
        throw new BadRequestException('Not allowed');
      }
    }

    const Bucket = video.s3Bucket || process.env.S3_BUCKET!;
    const Key = video.s3Key;

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentType: 'video/mp4', // helps some browsers
      }),
      { expiresIn },
    );

    return { url };
  }


}
