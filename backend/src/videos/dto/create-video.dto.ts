//src/vidoes/dto/create-video.dto.ts
import { Type, Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateVideoOptionDto {
  @IsString()
  text!: string;

  /**
   * Accept both `isCorrect` (new) and `correct` (legacy).
   * If neither provided, default false.
   */
  @Transform(({ value, obj }) => {
    // prefer payload.isCorrect; fall back to payload.correct
    if (typeof value === 'boolean') return value;
    if (typeof obj?.correct === 'boolean') return obj.correct;
    return false;
  })
  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateVideoQuestionDto {
  @IsString()
  text!: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Each question must have at least 2 options' })
  @ValidateNested({ each: true })
  @Type(() => CreateVideoOptionDto)
  options!: CreateVideoOptionDto[];
}

export class CreateVideoDto {
  @IsString()
  title!: string;

  @IsInt()
  categoryId!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  s3Key!: string;

  @IsInt()
  @Min(1)
  @Max(90)
  durationSec!: number;

  @IsArray()
  @ArrayMinSize(3, { message: 'At least 3 questions are required' })
  @ValidateNested({ each: true })
  @Type(() => CreateVideoQuestionDto)
  quiz!: CreateVideoQuestionDto[];
}
