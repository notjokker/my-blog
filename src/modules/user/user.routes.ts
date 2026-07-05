import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 获取当前登录用户信息（API，需认证）
router.get('/me', authenticate, async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, avatar: true, bio: true }
  });
  res.json(user);
});

// 更新个人资料（API，需认证）
router.put('/profile', authenticate, async (req: any, res: Response) => {
  const { name, bio, avatar } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatar: avatar !== undefined ? avatar : undefined
      },
      select: { id: true, email: true, name: true, avatar: true, bio: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 个人中心页面（公开，前端自行验证登录状态）
router.get('/profile', (_req: Request, res: Response) => {
  res.render('user/profile');
});
// 我的文章列表
router.get('/me/posts', authenticate, async (req: any, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { authorId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true }
  });
  res.json(posts);
});

// 我点赞的文章
router.get('/me/likes', authenticate, async (req: any, res: Response) => {
  const likes = await prisma.like.findMany({
    where: { userId: req.user.id },
    include: { post: { select: { id: true, title: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(likes.map(l => l.post));
});

// 我的评论
router.get('/me/comments', authenticate, async (req: any, res: Response) => {
  const comments = await prisma.comment.findMany({
    where: { userId: req.user.id },
    include: { post: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(comments);
});

// 我的浏览历史
router.get('/me/history', authenticate, async (req: any, res: Response) => {
  const history = await prisma.readHistory.findMany({
    where: { userId: req.user.id },
    include: { post: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(history.map(h => h.post));
});

export default router;