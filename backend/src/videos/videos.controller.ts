import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsString } from 'class-validator';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

class CommentDto {
  @IsString()
  text!: string;
}

@Controller('videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  // ===== Authoring & Management =====
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Req() req: any, @Body() dto: CreateVideoDto) {
    return this.videos.create(req.auth.sub, dto);
  }

  @Get()
  listMine(
    @Req() req: any,
    @Query('mine') mine?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    if (!mine) return [];
    return this.videos.listMine(req.auth.sub, take ? +take : 20, skip ? +skip : 0);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.videos.deleteOwn(req.auth.sub, id);
  }

  // ===== Playback =====
  @Get(':id/stream')
  async stream(@Req() req: any, @Param('id') id: string, @Query('expires') expires?: string) {
    const n = Math.max(60, Math.min(3600, Number(expires) || 900)); // 1–60 min
    return this.videos.getStreamUrl(req.auth?.sub, id, n);
  }

  @Get(':id')
getOne(@Param('id') id: string, @Req() req: any) {
  return this.videos.getById(id, req?.auth?.sub ?? null);
}


  // ===== Social: Likes & Comments =====
  @Post(':id/like')
  like(@Req() req: any, @Param('id') id: string) {
    return this.videos.like(req.auth.sub, id);
  }

  @Delete(':id/like')
  unlike(@Req() req: any, @Param('id') id: string) {
    return this.videos.unlike(req.auth.sub, id);
  }

  @Get(':id/comments')
  comments(@Param('id') id: string, @Query('take') take?: string, @Query('skip') skip?: string) {
    return this.videos.listComments(id, take ? +take : 20, skip ? +skip : 0);
  }

  @Post(':id/comments')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addComment(@Req() req: any, @Param('id') id: string, @Body() dto: CommentDto) {
    return this.videos.addComment(req.auth.sub, id, dto.text);
  }

  // ===== Feed anti-repeat =====
  /** Mark a video as seen (prevents repeats in FYP) */
  @Post(':id/seen')
  markSeen(@Req() req: any, @Param('id') id: string) {
    return this.videos.markSeen(req.auth.sub, id);
  }

  // ===== Quiz (video-only). For course sections, use /courses/submit-section-quiz =====
  /** Read quiz (safe: hides correct flags) for standalone video quizzes */
  @Get(':id/quiz')
  getVideoQuiz(@Param('id') id: string) {
    return this.videos.getVideoQuizPublic(id);
  }

  /** Attempt a standalone video quiz (does NOT affect SectionProgress) */
  @Post(':id/quiz/attempt')
  submitVideoQuiz(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: { answers: { questionId: string; selectedOptionId: string }[] },
  ) {
    return this.videos.submitVideoQuizAttempt(req.auth.sub, id, body?.answers || []);
  }
}
