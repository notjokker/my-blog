import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 获取文章评论（嵌套结构，支持回复）
router.get('/:postId/comments', async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true }
      },
      parent: {
        include: {
          user: { select: { id: true, name: true } }
        }
      },
      replies: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          parent: {
            include: {
              user: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // 只返回顶级评论（parentId 为 null），replies 字段包含嵌套回复
  const topComments = comments.filter(c => c.parentId === null);
  res.json(topComments);
});

// 发表评论（需登录，支持 parentId 回复）
router.post('/:postId/comments', authenticate, async (req: any, res: Response) => {
  const postId = Number(req.params.postId);
  const { content, parentId } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });

  const data: any = {
    content,
    userId: req.user.id,
    postId
  };

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: Number(parentId) } });
    if (!parentComment || parentComment.postId !== postId) {
      return res.status(400).json({ error: '无效的父评论' });
    }
    data.parentId = Number(parentId);
  }

  const comment = await prisma.comment.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      parent: {
        include: {
          user: { select: { id: true, name: true } }
        }
      }
    }
  });

  res.status(201).json(comment);
});

export default router;