"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = __importDefault(require("./config/passport"));
const post_routes_1 = __importDefault(require("./modules/post/post.routes"));
const like_routes_1 = __importDefault(require("./modules/like/like.routes"));
const comment_routes_1 = __importDefault(require("./modules/comment/comment.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const app = (0, express_1.default)();
// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '..', 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use('/docs', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'docs')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/upload', upload_routes_1.default);
// 初始化 passport
(0, passport_2.default)(passport_1.default);
app.use(passport_1.default.initialize());
// 健康检查
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 挂载路由
app.use('/posts', post_routes_1.default);
app.use('/api/posts', like_routes_1.default);
app.use('/api/posts', comment_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/auth', auth_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map