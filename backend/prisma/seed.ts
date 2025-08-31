// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const categories = [
  'General',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Pre-Med',
];

async function main() {
  const data = categories.map((name) => ({ name, slug: slugify(name) }));

  // Will insert what’s missing and skip duplicates on any unique field (name or slug)
  const result = await prisma.category.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} new categories (others already existed).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
