"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const marked_1 = require("marked");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 文章列表（公开）
router.get('/', async (_req, res) => {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
    });
    res.render('posts/index', { posts });
});
// 写新文章页面（需登录）
router.get('/new', auth_1.authenticate, (_req, res) => {
    res.render('posts/edit', { post: null });
});
// 编辑文章页面（需登录，且只能编辑自己的文章）
router.get('/edit/:id', auth_1.authenticate, async (req, res) => {
    const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
    if (!post || post.authorId !== req.user.id)
        return res.status(403).send('无权限');
    res.render('posts/edit', { post });
});
// 文章详情（公开，Markdown 转 HTML）
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
        where: { id: Number(id) },
        include: { author: true },
    });
    if (!post)
        return res.status(404).send('文章未找到');
    // 将 Markdown 内容转为 HTML
    const htmlContent = (0, marked_1.marked)(post.content);
    res.render('posts/show', { post: { ...post, content: htmlContent } });
});
// API：创建文章（需登录）
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content)
        return res.status(400).json({ error: '标题和内容不能为空' });
    const post = await prisma.post.create({
        data: {
            title,
            content, // 存储原始 Markdown
            published: true,
            authorId: req.user.id,
        },
    });
    res.status(201).json(post);
});
// API：更新文章（需登录）
router.put('/:id', auth_1.authenticate, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post || post.authorId !== req.user.id)
        return res.status(403).json({ error: '无权限' });
    const updated = await prisma.post.update({
        where: { id: Number(id) },
        data: { title, content },
    });
    res.json(updated);
});
exports.default = router;
//# sourceMappingURL=post.route.js.map