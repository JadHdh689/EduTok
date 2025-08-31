// src/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async setPreferences(authSub: string, categoryIds: number[]) {
    const me = await this.prisma.user.findUnique({ where: { authSub } });
    if (!me) throw new Error('User not found');

    // Upsert simple weights = 1
    await this.prisma.$transaction([
      this.prisma.userCategoryPreference.deleteMany({ where: { userId: me.id } }),
      this.prisma.userCategoryPreference.createMany({
        data: categoryIds.map(id => ({ userId: me.id, categoryId: id, weight: 1 })),
      }),
    ]);
    return { ok: true };
  }
}
