// src/courses/dto/enroll.dto.ts
import { IsString } from 'class-validator';
export class EnrollDto {
  @IsString() courseId!: string;
}
