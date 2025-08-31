import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class PresignDto {
  @IsString() @IsNotEmpty()
  fileName!: string;

  @IsString() @IsNotEmpty()
  contentType!: string;

  @IsString() @IsIn(['video', 'image', 'other'])
  kind!: 'video' | 'image' | 'other';
}
