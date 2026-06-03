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

function getPosts(dir = postsDir)
{
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let posts = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      posts = posts.concat(getPosts(fullPath)); // 递归
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { data } = matter(content);
      // slug 需要包含相对 posts 的路径（去掉 .md）
      const relativePath = path.relative(postsDir, fullPath);
      const slug = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
      posts.push({
        slug,
        title: data.title || '无标题',
        date: data.date || new Date().toISOString().slice(0, 10),
        tags: data.tags || [],
        excerpt: data.excerpt || ''
      });
    }
  }
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}//功能升级：能够读取子文件下的md文件

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
