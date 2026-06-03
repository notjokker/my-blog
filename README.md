# My Blog

一个基于 Node.js 和 Express 构建的个人博客项目，用于记录学习笔记、项目实践以及 AI 相关探索。

## 项目简介

本项目是一个从零开始开发的个人博客网站，采用 Markdown 作为文章存储格式，通过 Express 和 EJS 实现文章的动态渲染。

后续计划在博客基础上逐步实现：

* 用户注册与登录
* 评论系统
* 点赞系统
* 博客部署上线
* Music Agent 功能集成

## 技术栈

### 后端

* Node.js
* Express

### 前端

* EJS
* HTML
* CSS

### 内容管理

* Markdown
* gray-matter
* marked

## 当前功能

### 已完成

* 项目基础框架搭建
* Express 服务配置
* EJS 模板引擎配置
* Markdown 文章读取
* 文章列表展示
* 文章详情页渲染
* 静态资源管理

### 开发中

* 用户系统
* 评论功能
* 点赞功能

### 计划开发

* Music Agent 集成
* 在线部署
* 后台管理功能

## 项目结构

```text
my-blog
├── posts/            # Markdown文章
├── public/           # 静态资源
├── views/            # EJS模板
├── app.js            # 服务入口
├── package.json
└── vercel.json
```

## 本地运行

安装依赖：

```bash
npm install
```

启动项目：

```bash
npm start
```

默认访问：

```text
http://localhost:3000
```

## 开发计划

### 第一阶段

* 搭建博客基础框架
* 实现文章展示功能

### 第二阶段

* 用户注册与登录
* 评论与点赞功能

### 第三阶段

* Music Agent 集成
* 项目部署上线

## 项目目标

完成一个具备用户系统、博客系统以及 AI 功能扩展能力的个人博客网站，并持续记录开发与学习过程。
