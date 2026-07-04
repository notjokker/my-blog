"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 获取文章评论（按时间正序）
router.get('/:postId/comments', async (req, res) => {
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
router.post('/:postId/comments', auth_1.authenticate, async (req, res) => {
    const postId = Number(req.params.postId);
    const { content } = req.body;
    if (!content)
        return res.status(400).json({ error: '内容不能为空' });
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
exports.default = router;
//# sourceMappingURL=comment.routes.js.map