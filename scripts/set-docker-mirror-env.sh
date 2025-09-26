#!/bin/bash

# 设置 Docker 镜像加速环境变量脚本
# 该脚本会设置 DOCKER_REGISTRY_MIRROR 环境变量

# 设置镜像加速地址
export DOCKER_REGISTRY_MIRROR="https://docker.mirrors.ustc.edu.cn"

# 显示设置的环境变量
echo "已设置 Docker 镜像加速环境变量:"
echo "  export DOCKER_REGISTRY_MIRROR=$DOCKER_REGISTRY_MIRROR"

# 使用示例
echo ""
echo "使用方法:"
echo "  # 在构建时使用镜像加速"
echo "  DOCKER_BUILDKIT=1 docker build --registry-mirror=\$DOCKER_REGISTRY_MIRROR -t loan-app ."