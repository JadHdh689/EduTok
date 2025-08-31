import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AddChapterDto } from './dto/add-chapter.dto';
import { AddSectionDto } from './dto/add-section.dto';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { SubmitSectionQuizDto } from './dto/submit-section-quiz.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ===== Discovery =====
  listPublished(params: { q?: string; categoryId?: number; take?: number; skip?: number }) {
    const { q, categoryId, take = 12, skip = 0 } = params;
    const where: Prisma.CourseWhereInput = {
      published: true,
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { author: { displayName: { contains: q, mode: 'insensitive' } } },
              { author: { username: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    return this.prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async getPublicCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        category: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                video: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    durationSec: true,
                    s3Bucket: true,
                    s3Key: true,
                    thumbKey: true,
                  },
                },
              },
            },
          },
        },
        quizzes: { select: { id: true, title: true, courseId: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course || !course.published) throw new NotFoundException('Course not found');
    return course;
  }

  async getMyProgress(authSub: string, courseId: string) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new NotFoundException('User not found');

    const [enrollment, sectionProgress] = await Promise.all([
      this.prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId: me.id, courseId } },
      }),
      this.prisma.sectionProgress.findMany({
        where: { userId: me.id, section: { chapter: { courseId } } },
        select: { sectionId: true, completedAt: true, score: true, maxScore: true },
      }),
    ]);

    return {
      enrollment: enrollment ?? null,
      sections: sectionProgress,
    };
  }

  listMyEnrollments(authSub: string, take = 20, skip = 0) {
    return this.prisma.courseEnrollment.findMany({
      where: { user: { authSub } },
      orderBy: { startedAt: 'desc' },
      take,
      skip,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async listAuthored(authSub: string, take = 20, skip = 0) {
    return await this.prisma.course.findMany({
      where: { author: { authSub } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        coverImageUrl: true,
        category: { select: { id: true, name: true } },
      },
    });
  }

  // ===== Authoring =====
  async createCourse(authorAuthSub: string, dto: CreateCourseDto) {
    const author = await this.prisma.user.findUnique({ where: { authSub: authorAuthSub } });
    if (!author) throw new NotFoundException('User not found');

    return this.prisma.course.create({
      data: {
        authorId: author.id,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        published: !!dto.published,
      },
    });
  }

  async updateCourse(courseId: string, authorAuthSub: string, dto: UpdateCourseDto) {
    await this.ensureCourseOwner(courseId, authorAuthSub);
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title ?? undefined,
        categoryId: dto.categoryId ?? undefined,
        description: dto.description ?? undefined,
        coverImageUrl: dto.coverImageUrl ?? undefined,
        published: dto.published ?? undefined,
      },
    });
  }

  async publishCourse(courseId: string, authorAuthSub: string, published: boolean) {
    await this.ensureCourseOwner(courseId, authorAuthSub);
    return this.prisma.course.update({
      where: { id: courseId },
      data: { published },
    });
  }

  async deleteCourse(courseId: string, authorAuthSub: string) {
    await this.ensureCourseOwner(courseId, authorAuthSub);
    await this.prisma.course.delete({ where: { id: courseId } });
    return { ok: true };
  }

  async addChapter(courseId: string, dto: AddChapterDto, authorAuthSub: string) {
    await this.ensureCourseOwner(courseId, authorAuthSub);
    return this.prisma.chapter.create({
      data: { courseId, title: dto.title, order: dto.order },
    });
  }

  async deleteChapter(chapterId: string, authorAuthSub: string) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) throw new NotFoundException('Chapter not found');
    await this.ensureCourseOwner(chapter.courseId, authorAuthSub);
    await this.prisma.chapter.delete({ where: { id: chapterId } });
    return { ok: true };
  }

  /**
   * Now that video reuse is allowed, we do NOT block sections by videoId anymore.
   * We still enforce: video exists AND has a quiz with >= 3 questions.
   */
  async addSection(chapterId: string, dto: AddSectionDto, authorAuthSub: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    await this.ensureCourseOwner(chapter.courseId, authorAuthSub);

    // Ensure video exists and has a quiz (>=3)
    const video = await this.prisma.video.findUnique({
      where: { id: dto.videoId },
      include: { quiz: { include: { questions: true } } },
    });
    if (!video) throw new NotFoundException('Video not found');
    if (!video.quiz || video.quiz.questions.length < 3) {
      throw new BadRequestException('Video must have a quiz with at least 3 questions to be used as a section');
    }

    // No duplicate-usage check anymore (by design).
    return this.prisma.section.create({
      data: {
        chapterId,
        title: dto.title,
        order: dto.order,
        videoId: dto.videoId,
      },
    });
  }

  async deleteSection(sectionId: string, authorAuthSub: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { chapter: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    await this.ensureCourseOwner(section.chapter.courseId, authorAuthSub);
    await this.prisma.section.delete({ where: { id: sectionId } });
    return { ok: true };
  }

  // Optional: create a final exam by copying all section questions
  async generateFinalFromSections(courseId: string, authorAuthSub: string, count?: number, shuffle = true) {
    await this.ensureCourseOwner(courseId, authorAuthSub);

    const sections = await this.prisma.section.findMany({
      where: { chapter: { courseId } },
      include: {
        video: {
          include: {
            quiz: {
              include: { questions: { include: { options: true } } },
            },
          },
        },
      },
    });

    const allQuestions = sections.flatMap((s) => s.video.quiz?.questions ?? []);
    if (!allQuestions.length) throw new BadRequestException('No questions in sections');

    const pool = shuffle ? [...allQuestions].sort(() => Math.random() - 0.5) : [...allQuestions];
    const take = count ? Math.min(count, pool.length) : pool.length;
    const picked = pool.slice(0, take);

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: { title: 'Final Exam', courseId, passScore: null },
      });
      let order = 1;
      for (const q of picked) {
        const newQ = await tx.quizQuestion.create({
          data: { quizId: quiz.id, order: order++, text: q.text },
        });
        for (const o of q.options) {
          await tx.quizOption.create({
            data: { questionId: newQ.id, text: o.text, isCorrect: o.isCorrect },
          });
        }
      }
      return { finalQuizId: quiz.id, questions: take };
    });
  }

  // ===== Learner flow =====
  async enroll(authSub: string, courseId: string) {
    const user = await this.prisma.user.findUnique({ where: { authSub } });
    if (!user) throw new NotFoundException('User not found');

    // Idempotent enroll; flips UI on the frontend after re-fetch
    return this.prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      update: { status: EnrollmentStatus.IN_PROGRESS },
      create: {
        userId: user.id,
        courseId,
        status: EnrollmentStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  }

  async submitSectionQuiz(authSub: string, dto: SubmitSectionQuizDto) {
    const user = await this.prisma.user.findUnique({ where: { authSub } });
    if (!user) throw new NotFoundException('User not found');

    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      include: {
        chapter: true,
        video: {
          include: {
            quiz: { include: { questions: { include: { options: true } } } },
          },
        },
      },
    });
    if (!section) throw new NotFoundException('Section not found');

    const quiz = section.video.quiz;
    if (!quiz) throw new BadRequestException('Section video has no quiz');

    const courseId = section.chapter.courseId;

    // Grade
    const { score, max, answersPayload } = grade(
      quiz.questions.map((q) => ({
        id: q.id,
        options: q.options.map((o) => ({ id: o.id, correct: o.isCorrect })),
      })),
      dto.answers,
    );

    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.quizAttempt.create({
        data: {
          quizId: quiz.id,
          userId: user.id,
          startedAt: new Date(),
          completedAt: new Date(),
          score,
          maxScore: max,
          passed: score === max,
        },
      });

      for (const a of answersPayload) {
        await tx.quizAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            isCorrect: a.isCorrect,
          },
        });
      }

      const completed = score === max;

      await tx.sectionProgress.upsert({
        where: { userId_sectionId: { userId: user.id, sectionId: section.id } },
        update: {
          completedAt: completed ? new Date() : null,
          lastAttemptId: attempt.id,
          score,
          maxScore: max,
        },
        create: {
          userId: user.id,
          sectionId: section.id,
          completedAt: completed ? new Date() : null,
          lastAttemptId: attempt.id,
          score,
          maxScore: max,
        },
      });

      // Ensure enrollment exists (handles starting via FYP)
      await tx.courseEnrollment.upsert({
        where: { userId_courseId: { userId: user.id, courseId } },
        update: {},
        create: {
          userId: user.id,
          courseId,
          status: EnrollmentStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });

      // Recompute course progress
      const allSections = await tx.section.count({ where: { chapter: { courseId } } });
      const completedSections = await tx.sectionProgress.count({
        where: { userId: user.id, completedAt: { not: null }, section: { chapter: { courseId } } },
      });

      const pct = allSections ? Math.floor((completedSections / allSections) * 100) : 0;

      await tx.courseEnrollment.updateMany({
        where: { userId: user.id, courseId },
        data: { progressPct: pct, completedAt: pct === 100 ? new Date() : null },
      });

      return { attemptId: attempt.id, score, maxScore: max, completedSection: completed, progressPct: pct };
    });
  }

  // ===== Helpers =====
  private async ensureCourseOwner(courseId: string, authSub: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me || course.authorId !== me.id) {
      throw new BadRequestException('Only author can modify the course');
    }
  }
}

// local helper
function grade(
  questions: { id: string; options: { id: string; correct: boolean }[] }[],
  answers: { questionId: string; selectedOptionId: string }[],
) {
  const key = new Map<string, string>();
  for (const q of questions) {
    const correct = q.options.find((o) => o.correct);
    if (correct) key.set(q.id, correct.id);
  }
  let score = 0;
  const max = questions.length;
  const answersPayload = answers.map((a) => {
    const isCorrect = key.get(a.questionId) === a.selectedOptionId;
    if (isCorrect) score++;
    return { ...a, isCorrect };
  });
  return { score, max, answersPayload };
}
