# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 启用 corepack 以使用 pnpm
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖，因为需要编译 TypeScript）
RUN pnpm install

# 复制应用代码
COPY . .

# 构建 Next.js 应用
RUN pnpm run build

# 删除开发依赖以减小镜像大小
RUN pnpm prune --prod

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]