# 使用官方Node.js基础镜像（通过 docker.xuanyuan.me 镜像加速拉取）
ARG BASE_IMAGE=node:18-alpine
FROM ${BASE_IMAGE}

# 直接安装 pnpm 而不是使用 corepack
RUN npm install -g pnpm

# 配置 pnpm 使用 npmmirror 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖）
RUN pnpm install

# 复制应用代码
COPY . .

# 验证 middleware.ts 文件内容
RUN cat middleware.ts | head -20

# 构建 Next.js 应用
RUN pnpm run build

# 删除 node_modules 并重新安装依赖，但保留数据库迁移所需的开发依赖
RUN rm -rf node_modules && pnpm install

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]