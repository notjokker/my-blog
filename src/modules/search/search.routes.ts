import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// 搜索文章（支持标题和内容模糊匹配）
router.get('/', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.render('search', { results: [], query: '' });

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q as string, mode: 'insensitive' } },
        { content: { contains: q as string, mode: 'insensitive' } }
      ]
    },
    include: { author: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  res.render('search', { results: posts, query: q });
});

export default router;