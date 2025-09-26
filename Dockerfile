# 使用官方Node.js基础镜像
ARG BASE_IMAGE=node:18-alpine
FROM ${BASE_IMAGE}

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

# 注意：我们不再删除 devDependencies，因为运行时需要它们
# RUN pnpm prune --prod

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]