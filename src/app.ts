import express from 'express';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import passportConfig from './config/passport';
import postRoutes from './modules/post/post.routes';
import likeRoutes from './modules/like/like.routes';
import commentRoutes from './modules/comment/comment.routes';
import authRoutes from './modules/auth/auth.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/docs', express.static(path.join(__dirname, '..', 'public', 'docs'))); 
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRoutes);

// 初始化 passport
passportConfig(passport);
app.use(passport.initialize());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 挂载路由
app.use('/posts', postRoutes);
app.use('/api/posts', likeRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

export default app;
