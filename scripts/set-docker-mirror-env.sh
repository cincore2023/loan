#!/bin/bash

# 简化版Docker镜像源配置脚本
# 通过环境变量配置Docker镜像源

echo "设置Docker镜像源环境变量..."

# 设置Docker镜像源
export DOCKER_REGISTRY_MIRROR="https://pw6rk6ai.mirror.aliyuncs.com"
export DOCKER_BUILDKIT=1

echo "Docker镜像源已设置为: $DOCKER_REGISTRY_MIRROR"
echo "请在运行部署命令前执行以下命令以应用配置:"
echo "  export DOCKER_REGISTRY_MIRROR=https://pw6rk6ai.mirror.aliyuncs.com"
echo "  export DOCKER_BUILDKIT=1"

# 也可以直接在构建命令中使用
echo ""
echo "或者在构建时直接使用:"
echo "  DOCKER_BUILDKIT=1 docker build --registry-mirror=https://pw6rk6ai.mirror.aliyuncs.com -t loan-app -f Dockerfile.prod ."