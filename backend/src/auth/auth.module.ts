import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoClientProvider } from '../utils/CognitoClientProvider';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController],
  providers: [AuthService, CognitoClientProvider],
  exports: [AuthService],
})
export class AuthModule {}
