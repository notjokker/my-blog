"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const marked_1 = require("marked");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 文章列表（可按分类筛选，公开）
router.get('/', async (req, res) => {
    const { category } = req.query;
    const where = { published: true };
    if (category)
        where.categoryId = Number(category);
    const posts = await prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { author: true, category: true },
    });
    const categories = await prisma.category.findMany();
    res.set('Cache-Control', 'no-store');
    res.render('posts/index', { posts, categories, currentCategory: Number(category) || null });
});
// 写文章页面（公开）
router.get('/new', async (_req, res) => {
    const categories = await prisma.category.findMany();
    res.render('posts/edit', { post: null, categories });
});
// 编辑文章页面（公开，权限在API控制）
router.get('/edit/:id', async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId))
        return res.status(400).send('无效的文章ID');
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post)
        return res.status(404).send('文章不存在');
    const categories = await prisma.category.findMany();
    res.render('posts/edit', { post, categories });
});
// 文章详情（公开，支持浏览历史记录）
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId) || postId < 1) {
        return res.status(400).send('无效的文章ID');
    }
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: {
                select: { id: true, name: true, email: true, avatar: true, bio: true }
            },
            category: true,
        },
    });
    if (!post)
        return res.status(404).send('文章未找到');
    // 记录浏览历史（仅登录用户）
    if (req.user) {
        try {
            await prisma.readHistory.create({
                data: { userId: req.user.id, postId }
            });
        }
        catch (err) {
            // 忽略可能的重复记录错误
        }
    }
    const htmlContent = (0, marked_1.marked)(post.content);
    res.render('posts/show', { post: { ...post, content: htmlContent } });
});
// 创建文章（需登录）
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, content, categoryId } = req.body;
    if (!title || !content)
        return res.status(400).json({ error: '标题和内容不能为空' });
    const post = await prisma.post.create({
        data: {
            title,
            content,
            published: true,
            authorId: req.user.id,
            categoryId: categoryId ? Number(categoryId) : null,
        },
    });
    res.status(201).json(post);
});
// 更新文章（需登录，且是作者）
router.put('/:id', auth_1.authenticate, async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId))
        return res.status(400).json({ error: '无效的文章ID' });
    const { title, content, categoryId } = req.body;
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post)
        return res.status(404).json({ error: '文章不存在' });
    if (post.authorId !== req.user.id)
        return res.status(403).json({ error: '无权限' });
    const updated = await prisma.post.update({
        where: { id: postId },
        data: {
            title,
            content,
            categoryId: categoryId ? Number(categoryId) : null,
        },
    });
    res.json(updated);
});
// 删除文章（需登录，且是作者）
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId))
        return res.status(400).json({ error: '无效的文章ID' });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post)
        return res.status(404).json({ error: '文章不存在' });
    if (post.authorId !== req.user.id)
        return res.status(403).json({ error: '无权限' });
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: '删除成功' });
});
// 获取所有分类（公开）
router.get('/categories/all', async (_req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});
// 创建分类（需登录）
router.post('/categories', auth_1.authenticate, async (req, res) => {
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: '分类名不能为空' });
    try {
        const category = await prisma.category.create({ data: { name } });
        res.status(201).json(category);
    }
    catch (err) {
        res.status(400).json({ error: '分类已存在或创建失败' });
    }
});
// 删除分类（需登录）
router.delete('/categories/:id', auth_1.authenticate, async (req, res) => {
    const catId = Number(req.params.id);
    if (isNaN(catId))
        return res.status(400).json({ error: '无效的分类ID' });
    try {
        await prisma.category.delete({ where: { id: catId } });
        res.json({ message: '分类已删除' });
    }
    catch (err) {
        res.status(400).json({ error: '删除失败，可能分类不存在或仍有文章' });
    }
});
exports.default = router;
//# sourceMappingURL=post.routes.js.map