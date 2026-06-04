import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 挂载路由
import postRoutes from './modules/post/post.route';
app.use('/posts', postRoutes);

export default app;
