"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 获取点赞总数
router.get('/:postId/likes', async (req, res) => {
    const postId = Number(req.params.postId);
    const count = await prisma.like.count({ where: { postId } });
    res.json({ count });
});
// 切换点赞（需登录）
router.post('/:postId/like', auth_1.authenticate, async (req, res) => {
    const postId = Number(req.params.postId);
    const userId = req.user.id;
    try {
        const existing = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } }
        });
        if (existing) {
            await prisma.like.delete({ where: { id: existing.id } });
            res.json({ liked: false });
        }
        else {
            await prisma.like.create({ data: { userId, postId } });
            res.json({ liked: true });
        }
    }
    catch (err) {
        res.status(500).json({ error: '操作失败' });
    }
});
exports.default = router;
//# sourceMappingURL=like.routes.js.map