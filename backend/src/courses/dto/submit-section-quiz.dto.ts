// src/courses/dto/submit-section-quiz.dto.ts
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString() questionId!: string;
  @IsString() selectedOptionId!: string;
}

export class SubmitSectionQuizDto {
  @IsString() sectionId!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
