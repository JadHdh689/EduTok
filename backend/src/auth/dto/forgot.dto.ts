// src/auth/dto/forgot.dto.ts
 import { IsString } from 'class-validator'; export class ForgotDto { @IsString() username!: string; }