import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CoursesModule } from './courses/courses.module';
import { FollowsModule } from './follow/follow.module';
import { CategoriesModule } from './categories/categories.module';
import { FeedModule } from './feed/feed.module';
import { AuthMiddleware } from './middlewares/AuthMiddleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    VideosModule,
    CoursesModule,
    FollowsModule,
    CategoriesModule,
    FeedModule,
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer){
    consumer.apply(AuthMiddleware).forRoutes(
    '*',);
  }
}
