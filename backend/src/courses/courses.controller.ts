// src/courses/courses.controller.ts
import { Body, Controller, Param, Patch, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AddChapterDto } from './dto/add-chapter.dto';
import { AddSectionDto } from './dto/add-section.dto';
import { EnrollDto } from './dto/enroll.dto';
import { SubmitSectionQuizDto } from './dto/submit-section-quiz.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    return this.courses.createCourse(req.auth.sub, dto);
  }

  @Post(':courseId/chapters')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addChapter(@Req() req: any, @Param('courseId') courseId: string, @Body() dto: AddChapterDto) {
    return this.courses.addChapter(courseId, dto, req.auth.sub);
  }

  @Post('chapters/:chapterId/sections')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addSection(@Req() req: any, @Param('chapterId') chapterId: string, @Body() dto: AddSectionDto) {
    return this.courses.addSection(chapterId, dto, req.auth.sub);
  }

  @Post('enroll')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  enroll(@Req() req: any, @Body() dto: EnrollDto) {
    return this.courses.enroll(req.auth.sub, dto.courseId);
  }

  @Post('submit-section-quiz')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  submitSectionQuiz(@Req() req: any, @Body() dto: SubmitSectionQuizDto) {
    return this.courses.submitSectionQuiz(req.auth.sub, dto);
  }
}
