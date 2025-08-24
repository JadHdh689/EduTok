import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuizOptionDto {
  @IsString() text!: string;
  // Only one option per question should be true
  correct?: boolean;
}

class QuizQuestionDto {
  @IsString() text!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  @ArrayMinSize(2)
  options!: QuizOptionDto[];
}

export class CreateVideoDto {
  @IsString() title!: string;
  @IsInt() categoryId!: number;
  @IsOptional() @IsString() description?: string;
  @IsString() s3Key!: string;

  @IsInt() @Min(1) @Max(90) durationSec!: number;

  // Inline quiz (>= 3 questions) required by product rules
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  @ArrayMinSize(3)
  quiz!: QuizQuestionDto[];
}
