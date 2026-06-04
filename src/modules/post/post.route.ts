import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });
  res.render('posts/index', { posts });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: true },
  });
  if (!post) return res.status(404).send('文章未找到');
  res.render('posts/show', { post });
});

export default router;
