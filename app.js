const express = require('express');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const app = express();
const PORT = 3000;

// 1. 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 2. 指定静态文件目录（比如 CSS 就放在 public 文件夹里）
app.use(express.static(path.join(__dirname, 'public')));

// 文章存放目录
const postsDir = path.join(__dirname, 'posts');

// 3. 辅助函数：获取所有文章的基本信息（用于列表页）
function getPosts() {
  // 读取 posts 文件夹下的所有 .md 文件
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    // 使用 gray-matter 只提取元数据（标题、日期等），不解析全文，提高效率
    const { data } = matter(content);
    return {
      slug: file.replace('.md', ''),        // 文件名去掉 .md 作为文章的唯一标识
      title: data.title || '无标题',
      date: data.date || new Date().toISOString().slice(0, 10),
      tags: data.tags || [],
      excerpt: data.excerpt || ''
    };
  });

  // 按日期降序排列（最新的文章在最前面）
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

// 4. 首页路由：显示文章列表
app.get('/', (req, res) => {
  const posts = getPosts();
  res.render('index', { posts });  // 将文章数据传给 index.ejs
});

// 5. 文章详情路由：根据 slug 显示完整文章
app.get('/post/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(postsDir, `${slug}.md`);

  // 如果文件不存在，返回 404
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('文章未找到');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  // 解析元数据和 Markdown 正文
  const { data, content: markdownContent } = matter(content);
  // 将 Markdown 转换为 HTML
  const htmlContent = marked(markdownContent);

  res.render('post', {
    title: data.title || '无标题',
    date: data.date || '',
    tags: data.tags || [],
    content: htmlContent   // 转换后的 HTML
  });
});

// 6. 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 博客已启动：http://localhost:${PORT}`);
});
