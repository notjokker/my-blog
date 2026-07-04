"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
    });
    res.render('posts/index', { posts });
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
        where: { id: Number(id) },
        include: { author: true },
    });
    if (!post)
        return res.status(404).send('文章未找到');
    res.render('posts/show', { post });
});
exports.default = router;
//# sourceMappingURL=post.routes.js.map