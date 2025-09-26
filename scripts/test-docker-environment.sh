#!/bin/bash

# 测试 Docker 环境兼容性脚本
# 用于验证服务器上的 Docker 环境是否与部署脚本兼容

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

# 检查 Docker 版本
check_docker_version() {
  info "检查 Docker 版本..."
  
  if command -v docker &> /dev/null; then
    local version=$(docker --version)
    log "Docker 版本: $version"
    
    # 提取版本号
    local version_number=$(echo "$version" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    log "版本号: $version_number"
  else
    error "未找到 Docker"
    exit 1
  fi
}

# 检查 Docker Compose
check_docker_compose() {
  info "检查 Docker Compose..."
  
  if command -v docker-compose &> /dev/null; then
    local version=$(docker-compose --version)
    log "docker-compose 版本: $version"
  elif docker compose version &> /dev/null; then
    local version=$(docker compose version)
    log "docker compose 版本: $version"
  else
    error "未找到 docker-compose"
    exit 1
  fi
}

# 检查 BuildKit 支持
check_buildkit_support() {
  info "检查 BuildKit 支持..."
  
  if docker buildx version &> /dev/null; then
    local version=$(docker buildx version)
    log "Docker Buildx 版本: $version"
  elif docker build --help | grep -q buildkit; then
    log "Docker 支持 BuildKit (通过 build 命令)"
  else
    info "Docker 不支持 BuildKit"
  fi
}

# 检查镜像拉取
test_image_pull() {
  info "测试镜像拉取..."
  
  # 设置镜像加速地址
  local registry_mirror="https://docker.xuanyuan.me"
  
  log "使用镜像加速地址: $registry_mirror"
  
  # 测试拉取一个小镜像
  log "拉取 hello-world 镜像..."
  if DOCKER_BUILDKIT=1 docker build --registry-mirror="$registry_mirror" -t test-image - <<EOF
FROM hello-world
EOF
  then
    log "镜像拉取测试成功"
    # 清理测试镜像
    docker rmi test-image 2>/dev/null || true
  else
    error "镜像拉取测试失败"
  fi
}

# 主函数
main() {
  log "开始测试 Docker 环境兼容性..."
  
  check_docker_version
  check_docker_compose
  check_buildkit_support
  test_image_pull
  
  log "Docker 环境兼容性测试完成!"
  echo "您的环境与部署脚本兼容。"
}

# 执行主函数
main "$@"