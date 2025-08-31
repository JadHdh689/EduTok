import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Visibility } from '@prisma/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      include: {
        author: true,
        category: true,
        _count: { select: { likes: true, comments: true } }, // counts for UI
      },
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

  async listMine(authorAuthSub: string, take = 20, skip = 0) {
    const me = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
    if (!me) throw new NotFoundException('User not found');
    return this.prisma.video.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: 'asc' }, // 'desc' also fine—pick your UI sort
      take,
      skip,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } }, // counts for UI
      },
    });
  }

  async deleteOwn(authorAuthSub: string, videoId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
    if (!me) throw new NotFoundException('User not found');

    const v = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!v) throw new NotFoundException('Video not found');
    if (v.authorId !== me.id) throw new BadRequestException('Not your video');

    await this.prisma.video.delete({ where: { id: videoId } });
    return { ok: true };
  }

  async getStreamUrlById(videoId: string, authSub: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    const v = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!v) throw new NotFoundException('Video not found');

    // Example rule: allow anyone since visibility is PUBLIC; otherwise ensure author
    // if (v.visibility !== 'PUBLIC' && v.authorId !== me?.id) throw new BadRequestException('Forbidden');

    const cmd = new GetObjectCommand({ Bucket: v.s3Bucket, Key: v.s3Key });
    const url = await getSignedUrl(this.s3 as any, cmd, { expiresIn: 900 });
    return { url };
  }

  async getStreamUrl(authSub: string | undefined, videoId: string, expiresIn = 900) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

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
        ResponseContentType: 'video/mp4',
      }),
      { expiresIn },
    );

    return { url };
  }

  async like(authSub: string, videoId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    await this.prisma.videoLike.create({ data: { userId: me.id, videoId } });
    return { ok: true };
  }

  async unlike(authSub: string, videoId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    await this.prisma.videoLike.delete({ where: { userId_videoId: { userId: me.id, videoId } } });
    return { ok: true };
  }

  async listComments(videoId: string, take = 20, skip = 0) {
    return this.prisma.videoComment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
  }

  async addComment(authSub: string, videoId: string, text: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    return this.prisma.videoComment.create({ data: { videoId, authorId: me.id, text } });
  }

  async markSeen(authSub: string, videoId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');
    await this.prisma.userVideoSeen.upsert({
      where: { userId_videoId: { userId: me.id, videoId } },
      update: {},
      create: { userId: me.id, videoId },
    });
    return { ok: true };
  }

  /** Return a video's quiz with options but without isCorrect flags */
  async getVideoQuizPublic(videoId: string) {
    const v = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: { options: { select: { id: true, text: true } } }, // hide isCorrect
            },
          },
        },
        sectionUsed: true, // if part of a section, frontend should call courses flow instead
      },
    });
    if (!v) throw new NotFoundException('Video not found');
    if (!v.quiz)
      return {
        quiz: null,
        section: v.sectionUsed ? { id: v.sectionUsed.id, chapterId: v.sectionUsed.chapterId } : null,
      };
    return {
      quiz: {
        id: v.quiz.id,
        title: v.quiz.title,
        questions: v.quiz.questions.map((q) => ({ id: q.id, text: q.text, options: q.options })),
      },
      section: v.sectionUsed ? { id: v.sectionUsed.id, chapterId: v.sectionUsed.chapterId } : null,
    };
  }

  /** Grade a video-only quiz and store attempt (does NOT touch SectionProgress) */
  async submitVideoQuizAttempt(
    authSub: string,
    videoId: string,
    answers: { questionId: string; selectedOptionId: string }[],
  ) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');

    const v = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { quiz: { include: { questions: { include: { options: true } } } }, sectionUsed: true },
    });
    if (!v) throw new NotFoundException('Video not found');
    if (!v.quiz) throw new BadRequestException('Video has no quiz');
    if (v.sectionUsed) {
      // If it’s part of a course section, frontend should hit /courses/submit-section-quiz instead
      throw new BadRequestException('This video belongs to a course section. Use /courses/submit-section-quiz.');
    }

    const key = new Map<string, string>();
    for (const q of v.quiz.questions) {
      const c = q.options.find((o) => o.isCorrect);
      if (c) key.set(q.id, c.id);
    }
    let score = 0;
    for (const a of answers) if (key.get(a.questionId) === a.selectedOptionId) score++;

    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.create({
        data: {
          quizId: v.quiz!.id,
          userId: me.id,
          startedAt: new Date(),
          completedAt: new Date(),
          score,
          maxScore: v.quiz!.questions.length,
          passed: score === v.quiz!.questions.length,
        },
      });
      for (const a of answers) {
        await tx.quizAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            isCorrect: key.get(a.questionId) === a.selectedOptionId,
          },
        });
      }
      return {
        attemptId: attempt.id,
        score,
        maxScore: v.quiz!.questions.length,
        passed: score === v.quiz!.questions.length,
      };
    });
  }
}
