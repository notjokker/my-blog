"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 获取当前登录用户信息（API，需认证）
router.get('/me', auth_1.authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, avatar: true, bio: true }
    });
    res.json(user);
});
// 更新个人资料（API，需认证）
router.put('/profile', auth_1.authenticate, async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ error: '更新失败' });
    }
});
// 个人中心页面（公开，前端自行验证登录状态）
router.get('/profile', (_req, res) => {
    res.render('user/profile');
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map