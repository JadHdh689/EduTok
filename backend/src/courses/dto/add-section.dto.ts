// src/courses/dto/add-section.dto.ts
import { IsInt, IsString, Min } from 'class-validator';
export class AddSectionDto {
  @IsString() title!: string;
  @IsInt() @Min(1) order!: number;
  @IsString() videoId!: string; // uses an existing ≤90s video
}
