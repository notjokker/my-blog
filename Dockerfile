#初始构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./ 
RUN npm ci  #安装依赖，更快更严格
COPY . . #复制项目所有文件

#生产运行
EXPOSE 3000
CMD ["node","app.js"]  #定义容器启动时执行的目标命令
