import { IsInt, IsString, Min } from 'class-validator';
export class AddChapterDto {
  @IsString() title!: string;
  @IsInt() @Min(1) order!: number;
}
