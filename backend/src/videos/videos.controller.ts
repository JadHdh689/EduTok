import { Body, Controller, Get, Param, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Req() req: any, @Body() dto: CreateVideoDto) {
    return this.videos.create(req.auth.sub, dto);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    return this.videos.getById(id, req.auth.sub);
  }
}
