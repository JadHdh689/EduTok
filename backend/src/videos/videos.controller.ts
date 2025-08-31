import { Body, Controller, Delete, Get, Param, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('videos')
export class VideosController {
  constructor(private readonly videos: VideosService) {}

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

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.videos.getById(id, req.auth.sub);
  }
}
