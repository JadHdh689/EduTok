// src/follow/follow.dto.ts
import { IsString } from 'class-validator';
export class FollowDto { @IsString() userId!: string; }
