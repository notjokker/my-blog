"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 获取文章评论（嵌套结构，支持回复）
router.get('/:postId/comments', async (req, res) => {
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
router.post('/:postId/comments', auth_1.authenticate, async (req, res) => {
    const postId = Number(req.params.postId);
    const { content, parentId } = req.body;
    if (!content)
        return res.status(400).json({ error: '内容不能为空' });
    const data = {
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
exports.default = router;
//# sourceMappingURL=comment.routes.js.map