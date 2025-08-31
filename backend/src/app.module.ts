// app.module.ts
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { CoursesModule } from './courses/courses.module';
import { FollowsModule } from './follow/follow.module';
import { CategoriesModule } from './categories/categories.module';
import { FeedModule } from './feed/feed.module';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module'; // <-- add
import { ProfileModule } from './profile/profile.module'; // <-- add
import { PublicProfilesModule } from './public-profiles/public-profiles.module';
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
    AuthModule,   
    UploadsModule,    // <-- add
    ProfileModule,    // <-- add (optional but handy)
    PublicProfilesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
