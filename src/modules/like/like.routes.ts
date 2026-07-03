import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 获取点赞总数
router.get('/:postId/likes', async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const count = await prisma.like.count({ where: { postId } });
  res.json({ count });
});

// 切换点赞（需登录）
router.post('/:postId/like', authenticate, async (req: any, res: Response) => {
  const postId = Number(req.params.postId);
  const userId = req.user.id;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, postId } });
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: '操作失败' });
  }
});

export default router;
