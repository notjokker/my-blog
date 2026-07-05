import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 获取当前登录用户信息（用于个人中心）
router.get('/me', authenticate, async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, avatar: true, bio: true }
  });
  res.json(user);
});

// 更新个人资料
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

// 渲染个人中心页面
router.get('/profile', authenticate, async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, avatar: true, bio: true }
  });
  res.render('user/profile', { user });
});

export default router;