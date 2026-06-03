# 简介
欢迎来到notjokker的第一个个人博客。（正在严肃施工中，有点迷迷糊糊）
首先这个博客一定要完成最基本的功能（比如内容展示，交互界面什么的），以及其他一些能代表作者自己的东西（包括但不限于作者会把之前做的一些丑丑的小项目和复刻一些作者小时候最爱玩的小游戏，怀旧感拉满了）。当然了，作者才疏学浅，ddl其实也挺紧张（脑子里突然涌进这么多新鲜的事物虽然有ai助我一臂之力但真正实践起来才发现ai还是取代不了人类。。。），所以走过路过的朋友请畅所欲言，你们的建议是我最大的行动动力。
总而言之，统而言之，欢迎光临，欢迎回家。
## 预期项目架构
blog-server/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts                 # 入口
│   ├── app.ts                   # Express 配置
│   ├── config/
│   │   ├── database.ts          # Prisma 客户端
│   │   ├── redis.ts             # Redis 连接
│   │   └── passport.ts          # 认证策略
│   ├── modules/
│   │   ├── auth/                # 用户认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/                # 用户信息管理
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.validation.ts
│   │   ├── post/                # 文章 CRUD
│   │   │   ├── post.controller.ts
│   │   │   ├── post.service.ts
│   │   │   ├── post.routes.ts
│   │   │   └── post.validation.ts
│   │   ├── like/                # 点赞
│   │   │   ├── like.controller.ts
│   │   │   ├── like.service.ts
│   │   │   └── like.routes.ts
│   │   ├── comment/             # 评论（含划线引用）
│   │   │   ├── comment.controller.ts
│   │   │   ├── comment.service.ts
│   │   │   └── comment.routes.ts
│   │   ├── subscription/        # 订阅
│   │   │   ├── subscription.controller.ts
│   │   │   ├── subscription.service.ts
│   │   │   └── subscription.routes.ts
│   │   ├── search/              # 搜索
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.routes.ts
│   │   ├── ai/                  # AI 助手
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── ai.routes.ts
│   │   └── upload/              # 文件上传（编辑器图片等）
│   │       ├── upload.controller.ts
│   │       ├── upload.service.ts
│   │       └── upload.routes.ts
│   ├── middleware/
│   │   ├── auth.ts              # JWT 验证中间件
│   │   ├── rateLimiter.ts       # 限流
│   │   ├── errorHandler.ts      # 统一错误处理
│   │   └── validation.ts        # 请求校验
│   ├── utils/
│   │   ├── markdown.ts          # Markdown 渲染与清洗
│   │   ├── email.ts             # 邮件发送（订阅通知）
│   │   └── logger.ts            # 日志
│   └── types/
│       └── index.ts             # 公共类型
├── public/                      # 静态文件（前端打包后）
└── uploads/                     # 用户上传文件存储
## 预期后端数据库
// 用户
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  avatar    String?
  bio       String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  likes     Like[]
  comments  Comment[]
  subscriptions Subscription[]
  aiChats   AiChat[]
}

enum Role {
  USER
  ADMIN
}

// 文章
model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  content     String     // Markdown 源
  excerpt     String?
  coverImage  String?
  published   Boolean    @default(false)
  author      User       @relation(fields: [authorId], references: [id])
  authorId    String
  tags        String[]   // 标签数组
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  likes       Like[]
  comments    Comment[]
  subscriptions Subscription[]
}

// 点赞（唯一用户+文章）
model Like {
  id     String @id @default(cuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}

// 评论
model Comment {
  id        String   @id @default(cuid())
  body      String
  // 划线引用
  quote     String?  // 被引用的原文片段
  quotePosition Object? // 可选，存储划线起止位置（行号、偏移等）
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  parentId  String?  // 支持嵌套回复
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 订阅（可订阅某个用户或某个标签）
model Subscription {
  id        String   @id @default(cuid())
  subscriber User    @relation(fields: [subscriberId], references: [id])
  subscriberId String
  // 订阅目标：可空，如果订阅整个博客则为 null
  targetUser   User?  @relation(fields: [targetUserId], references: [id])
  targetUserId String?
  targetTag    String? // 订阅某个标签
  createdAt DateTime @default(now())
  @@unique([subscriberId, targetUserId, targetTag])
}

// AI 对话历史
model AiChat {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  messages  Json     // 存储 [{role, content}] 数组
  createdAt DateTime @default(now())
}
## API 设计
所有 API 路径前缀 /api/v1，返回 JSON。需要认证的接口在请求头携带 Authorization: Bearer <token>。

1. 认证模块 /auth
POST	/auth/register	注册（username, email, password）	
POST	/auth/login	登录，返回 JWT	
POST	/auth/logout	登出（客户端删除 token 即可）	
GET	/auth/me	获取当前登录用户信息	（需认证）

3. 用户模块 /users
GET	/users/:id	查看用户公开信息	否
PUT	/users/me	更新自己的资料（头像, bio 等）	（需认证）
GET	/users/me/posts	获取自己的文章列表	（需认证）

5. 文章模块 /posts
GET	/posts	文章列表（分页、按标签筛选、排序）	否
GET	/posts/:slug	文章详情（含点赞数、评论数）	否
POST	/posts	创建文章	（需认证）
PUT	/posts/:slug	更新文章	（需认证）（作者或 admin）
DELETE	/posts/:slug	删除文章	（需认证）（作者或 admin）
GET	/posts/search?q=keyword	全文搜索文章	否

7. 点赞模块 /posts/:slug/like
POST	/posts/:slug/like	点赞（幂等）	（需认证）
DELETE	/posts/:slug/like	取消点赞	（需认证）
GET	/posts/:slug/likes	获取点赞数	否

9. 评论模块 /posts/:slug/comments
GET	/posts/:slug/comments	获取评论列表（树形）	否
POST	/posts/:slug/comments	添加评论（body, quote?, parentId?）	（需认证）
PUT	/comments/:id	编辑自己的评论	（需认证）（作者）
DELETE	/comments/:id	删除评论	（需认证）（作者或 admin）
划线引用：客户端划选文本后，获取选中文字和位置信息（如段落索引、字符偏移），随评论一起发送 quote 和 quotePosition。展示时可高亮对应原文。

10. 订阅模块 /subscriptions（需认证）
POST	/subscriptions	创建订阅（targetUserId? targetTag?）	
GET	/subscriptions	我的订阅列表	
DELETE	/subscriptions/:id	取消订阅	
GET	/subscriptions/feed	获取我订阅的内容更新

12. AI 助手 /ai （需认证）
POST	/ai/chat	发送消息，返回 AI 回复	是
GET	/ai/history	获取当前用户的对话历史	是
DELETE	/ai/history/:id	删除某次对话	是

13. 文件上传 /upload （需认证）
POST	/upload	上传图片/文件，返回 URL	是
