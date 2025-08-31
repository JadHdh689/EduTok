import { IsString } from 'class-validator';

export class SignInDto {
  /** email or username */
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}
