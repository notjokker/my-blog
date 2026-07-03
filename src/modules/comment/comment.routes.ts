import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 获取文章评论（按时间正序）
router.get('/:postId/comments', async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  res.json(comments);
});

// 发表评论（需登录）
router.post('/:postId/comments', authenticate, async (req: any, res: Response) => {
  const postId = Number(req.params.postId);
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: req.user.id,
      postId
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });
  res.status(201).json(comment);
});

export default router;
