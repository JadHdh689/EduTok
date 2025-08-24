import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString() title!: string;
  @IsInt() categoryId!: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsBoolean() published?: boolean;
}
