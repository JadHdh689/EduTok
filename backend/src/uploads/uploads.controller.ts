import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
}
