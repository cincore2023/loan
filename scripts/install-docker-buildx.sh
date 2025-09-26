#!/bin/bash

# Docker Buildx安装脚本
# 用于安装Docker Buildx组件以支持BuildKit

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

info() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# 检查系统架构
get_architecture() {
  local arch=$(uname -m)
  case $arch in
    x86_64)
      echo "amd64"
      ;;
    aarch64|arm64)
      echo "arm64"
      ;;
    armv7l)
      echo "arm-v7"
      ;;
    *)
      echo "$arch"
      ;;
  esac
}

# 安装Docker Buildx
install_buildx() {
  info "安装Docker Buildx组件..."
  
  # 获取最新的buildx版本
  local latest_version=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep tag_name | cut -d '"' -f 4)
  if [ -z "$latest_version" ]; then
    error "无法获取最新的buildx版本"
    exit 1
  fi
  
  info "最新版本: $latest_version"
  
  # 获取系统架构
  local arch=$(get_architecture)
  info "系统架构: $arch"
  
  # 下载buildx插件
  local download_url="https://github.com/docker/buildx/releases/download/$latest_version/buildx-$latest_version.linux-$arch"
  info "下载地址: $download_url"
  
  # 创建Docker CLI插件目录
  mkdir -p ~/.docker/cli-plugins
  
  # 下载并安装
  curl -s -L "$download_url" -o ~/.docker/cli-plugins/docker-buildx
  
  # 添加执行权限
  chmod a+x ~/.docker/cli-plugins/docker-buildx
  
  # 验证安装
  if docker buildx version &> /dev/null; then
    log "Docker Buildx安装成功"
  else
    error "Docker Buildx安装失败"
    exit 1
  fi
}

# 创建默认构建器实例
create_builder() {
  info "创建默认构建器实例..."
  
  # 检查是否已存在默认构建器
  if docker buildx inspect default &> /dev/null; then
    info "默认构建器已存在"
  else
    # 创建新的构建器实例
    docker buildx create --name default --use
    log "默认构建器创建完成"
  fi
  
  # 启动构建器
  docker buildx inspect default --bootstrap
  
  log "构建器准备就绪"
}

# 主函数
main() {
  log "开始安装Docker Buildx..."
  
  # 检查Docker是否安装
  if ! command -v docker &> /dev/null; then
    error "未找到Docker。请先安装Docker。"
    exit 1
  fi
  
  install_buildx
  create_builder
  
  log "Docker Buildx安装完成!"
  echo "现在可以使用BuildKit功能了"
}

# 执行主函数
main "$@"