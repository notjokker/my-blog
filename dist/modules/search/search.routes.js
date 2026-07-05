"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 搜索文章（支持标题和内容模糊匹配）
router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q)
        return res.render('search', { results: [], query: '' });
    const posts = await prisma.post.findMany({
        where: {
            published: true,
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } }
            ]
        },
        include: { author: true, category: true },
        orderBy: { createdAt: 'desc' }
    });
    res.render('search', { results: posts, query: q });
});
exports.default = router;
//# sourceMappingURL=search.routes.js.map