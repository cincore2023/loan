#!/bin/bash

# 应用更新脚本
# 用于在不丢失数据的情况下更新应用

set -e

echo "🔄 开始更新应用..."

# 拉取最新代码（如果这是一个git仓库）
if [ -d ".git" ]; then
  echo "📥 拉取最新代码..."
  git pull
else
  echo "⚠️  当前目录不是git仓库，跳过代码更新"
fi

# 检查是否需要重新构建
echo "🔍 检查是否需要重新构建..."
REBUILD=false

# 检查关键文件是否有变化
if [ -f "package.json" ]; then
  echo "📦 检查依赖变化..."
  # 这里可以添加更复杂的依赖检查逻辑
  REBUILD=true
fi

if [ -f "Dockerfile.prod" ]; then
  echo "🏗️  检查Dockerfile变化..."
  # 这里可以添加更复杂的Dockerfile检查逻辑
  REBUILD=true
fi

# 重新构建镜像
if [ "$REBUILD" = true ]; then
  echo "🏗️  重新构建镜像..."
  docker-compose -f docker-compose.prod.yml build
else
  echo "✅ 无需重新构建镜像"
fi

# 停止当前服务
echo "⏹️  停止当前服务..."
docker-compose -f docker-compose.prod.yml down

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ 应用更新完成!"
echo "应用查看: http://localhost:3000"