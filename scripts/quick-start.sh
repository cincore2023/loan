#!/bin/bash

# 快速启动脚本
# 用于首次部署或完全重新部署应用

set -e

echo "🚀 开始部署应用..."

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
  echo "⚠️  未找到 .env 文件，正在创建..."
  cp .env.example .env
  echo "✅ 已创建 .env 文件，请根据需要修改其中的配置"
  echo "   编辑命令: vim .env"
  echo "   修改完成后按回车键继续..."
  read
fi

# 给脚本添加执行权限
echo "🔧 设置脚本权限..."
chmod +x scripts/*.sh

# 设置Docker镜像加速
echo "⚡ 设置Docker镜像加速..."
export DOCKER_REGISTRY_MIRROR="https://pw6rk6ai.mirror.aliyuncs.com"
export DOCKER_BUILDKIT=1

# 部署应用
echo "📦 部署应用..."
./scripts/deploy.sh --build --migrate --seed

echo "✅ 部署完成!"
echo "应用查看: http://localhost:3000"
echo "数据库查看: localhost:5433"