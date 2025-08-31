// src/users/users.module.ts
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CognitoClientProvider } from '../utils/CognitoClientProvider';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, CognitoClientProvider],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'users/me', method: RequestMethod.GET },
        { path: 'users', method: RequestMethod.PATCH },
      );
  }
}
