// src/auth/dto/signup.dto.ts

import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  username?: string; // defaults to email if omitted

  @IsString()
  @MinLength(8)
  password!: string;
}