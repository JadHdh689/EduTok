import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AddChapterDto } from './dto/add-chapter.dto';
import { AddSectionDto } from './dto/add-section.dto';
import { EnrollDto } from './dto/enroll.dto';
import { SubmitSectionQuizDto } from './dto/submit-section-quiz.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  // ===== Public listing / discovery =====
  @Get()
  list(
    @Req() req: any,
    @Query('mine') mine?: string,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    if (mine === '1') {
      return this.courses.listAuthored(req.auth.sub, take ? +take : 20, skip ? +skip : 0);
    }
    return this.courses.listPublished({
      q,
      categoryId: categoryId ? +categoryId : undefined,
      take: take ? +take : 12,
      skip: skip ? +skip : 0,
    });
  }

  @Get(':courseId')
  getPublic(@Param('courseId') id: string) {
    return this.courses.getPublicCourse(id);
  }

  @Get(':courseId/progress/me')
  myProgress(@Req() req: any, @Param('courseId') id: string) {
    return this.courses.getMyProgress(req.auth.sub, id);
  }

  @Get('enrollments/me')
  myEnrollments(@Req() req: any, @Query('take') take?: string, @Query('skip') skip?: string) {
    return this.courses.listMyEnrollments(req.auth.sub, take ? +take : 20, skip ? +skip : 0);
  }

  // ===== Authoring =====
  @Post()
  createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    return this.courses.createCourse(req.auth.sub, dto);
  }

  @Patch(':courseId')
  updateCourse(@Req() req: any, @Param('courseId') courseId: string, @Body() dto: UpdateCourseDto) {
    return this.courses.updateCourse(courseId, req.auth.sub, dto);
  }

  @Patch(':courseId/publish')
  publish(@Req() req: any, @Param('courseId') courseId: string, @Body() body: { published: boolean }) {
    return this.courses.publishCourse(courseId, req.auth.sub, !!body.published);
  }

  @Delete(':courseId')
  deleteCourse(@Req() req: any, @Param('courseId') courseId: string) {
    return this.courses.deleteCourse(courseId, req.auth.sub);
  }

  @Post(':courseId/chapters')
  addChapter(@Req() req: any, @Param('courseId') courseId: string, @Body() dto: AddChapterDto) {
    return this.courses.addChapter(courseId, dto, req.auth.sub);
  }

  @Delete('chapters/:chapterId')
  deleteChapter(@Req() req: any, @Param('chapterId') chapterId: string) {
    return this.courses.deleteChapter(chapterId, req.auth.sub);
  }

  @Post('chapters/:chapterId/sections')
  addSection(@Req() req: any, @Param('chapterId') chapterId: string, @Body() dto: AddSectionDto) {
    return this.courses.addSection(chapterId, dto, req.auth.sub);
  }

  @Delete('sections/:sectionId')
  deleteSection(@Req() req: any, @Param('sectionId') sectionId: string) {
    return this.courses.deleteSection(sectionId, req.auth.sub);
  }

  // Optional: generate a final exam from all section quizzes
  @Post(':courseId/final/generate')
  generateFinal(@Req() req: any, @Param('courseId') courseId: string) {
    return this.courses.generateFinalFromSections(courseId, req.auth.sub);
  }

  // ===== Learning flow =====
  @Post('enroll')
  enroll(@Req() req: any, @Body() dto: EnrollDto) {
    return this.courses.enroll(req.auth.sub, dto.courseId);
  }

  @Post('submit-section-quiz')
  submitSectionQuiz(@Req() req: any, @Body() dto: SubmitSectionQuizDto) {
    return this.courses.submitSectionQuiz(req.auth.sub, dto);
  }
}
