import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Post('prefs')
  setPrefs(@Req() req: any, @Body() body: { categoryIds: number[] }) {
    return this.categories.setPreferences(req.auth.sub, body.categoryIds || []);
  }
}
