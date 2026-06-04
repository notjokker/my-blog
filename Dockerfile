FROM node:20-alpine AS builder

WORKDIR /app

# 安装编译工具
RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src/ ./src/
COPY prisma/ ./prisma/
COPY views/ ./views/
COPY public/ ./public/

RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物和必要目录
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/views ./views      
COPY --from=builder /app/public ./public    


# 生成 Prisma Client（利用已有的 schema）
RUN npx prisma generate

# 复制环境变量模板
COPY .env.example ./.env

EXPOSE 3000
CMD ["node", "dist/index.js"]
