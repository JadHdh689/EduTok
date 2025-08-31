// prisma/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // Connect on bootstrap
  async onModuleInit() {
    await this.$connect();
  }
}
