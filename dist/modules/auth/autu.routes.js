"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 注册
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashed, name },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        res.status(400).json({ error: '注册失败，邮箱可能已存在' });
    }
});
// 登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        res.status(500).json({ error: '服务器错误' });
    }
});
// 渲染登录页面
router.get('/login', (_req, res) => res.render('auth/login'));
router.get('/register', (_req, res) => res.render('auth/register'));
exports.default = router;
//# sourceMappingURL=autu.routes.js.map