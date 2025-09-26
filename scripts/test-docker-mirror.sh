#!/bin/bash

# 测试Docker镜像源配置
# 用于验证Docker是否正确使用阿里云镜像加速

set -e

echo "测试Docker镜像源配置..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
  echo "错误: 未找到 Docker。请先安装 Docker。"
  exit 1
fi

echo "Docker版本信息:"
docker --version

echo "Docker详细信息:"
docker info | grep -i -A 5 -B 5 registry

# 测试拉取一个镜像
echo "测试拉取镜像..."
time docker pull hello-world

echo "如果拉取速度较快，说明镜像源配置正常。"