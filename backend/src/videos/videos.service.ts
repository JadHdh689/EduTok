import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Visibility } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(authorAuthSub: string, dto: CreateVideoDto) {
    if (dto.durationSec > 90) throw new BadRequestException('Video must be ≤ 90 seconds');
    // Ensure exactly one correct option per question
    for (const q of dto.quiz) {
      const correctCount = q.options.filter(o => o.correct === true).length;
      if (correctCount !== 1) {
        throw new BadRequestException('Each question must have exactly one correct option');
      }
    }

    const author = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
    if (!author) throw new NotFoundException('User not found');

    // Create video + quiz in one transaction
    return this.prisma.$transaction(async tx => {
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
          passScore: null, // optional
        },
      });

      // Create questions/options
      for (let qi = 0; qi < dto.quiz.length; qi++) {
        const q = dto.quiz[qi];
        const question = await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            order: qi + 1,
            text: q.text,
          },
        });
        for (const opt of q.options) {
          await tx.quizOption.create({
            data: {
              questionId: question.id,
              text: opt.text,
              isCorrect: !!opt.correct,
            },
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
}
