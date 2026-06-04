import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清除旧数据（开发环境）
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'demo@blog.com',
      name: 'Demo User',
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: '我的第一篇博客',
        content: 'hello world！',
        published: true,
        authorId: user.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
