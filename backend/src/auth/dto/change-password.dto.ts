// src/auth/dto/change-password.dto.ts

import { IsString, MinLength } from 'class-validator'; export class ChangePasswordDto { @IsString() currentPassword!: string; @IsString() @MinLength(8) newPassword!: string; }