import { IsString } from 'class-validator';

export class ConfirmSignUpDto {
  /** email or username (must match what you used at signup) */
  @IsString()
  username!: string;

  @IsString()
  code!: string;
}
