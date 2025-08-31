// src/courses/dto/add-chapter.dto.ts
import { IsInt, IsString, Min } from 'class-validator';
export class AddChapterDto {
  @IsString() title!: string;
  @IsInt() @Min(1) order!: number;
}
