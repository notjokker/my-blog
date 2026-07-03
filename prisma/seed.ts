import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@blog.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  await prisma.post.createMany({
    data: [
      { title: '我的第一篇博客', content: '这是我使用 Docker + Express + Prisma 搭建的博客。内容很丰富！', published: true, authorId: user.id },
      { title: 'TypeScript 入门指南', content: 'TypeScript 是 JavaScript 的超集...', published: true, authorId: user.id },
      { title: 'Docker 容器化实践', content: '本文记录了我将博客容器化的过程...', published: false, authorId: user.id },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
