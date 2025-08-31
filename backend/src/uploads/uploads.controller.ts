// src/uploads/uploads.controller.ts
import { Body, Controller, Get, Post, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { PresignDto } from './dto/presign.dto';

@Controller('uploads')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('presign')
  presign(@Body() dto: PresignDto) {
    return this.uploads.presign(dto.fileName, dto.contentType, dto.kind);
  }
  @Get('sign-get')
  async signGet(@Req() req: any, @Query('key') key: string, @Query('expires') expires?: string) {
    // If you want to restrict who can access which key, add checks here.
    const expiresSec = expires ? +expires : undefined;
    return this.uploads.signGetUrl({ key, expiresSec });
  }
}
