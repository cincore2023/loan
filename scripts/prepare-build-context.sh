#!/bin/bash

# 准备构建上下文脚本
# 用于优化Docker构建过程，减少不必要的文件打包

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

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# 清理临时文件
cleanup_temp_files() {
  info "清理临时文件..."
  
  # 清理常见的临时文件和目录
  local temp_patterns=(
    "node_modules/.cache"
    ".next/cache"
    "tmp/*"
    "temp/*"
    "*.log"
    "*.tmp"
    "*.bak"
  )
  
  for pattern in "${temp_patterns[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
      rm -rf $pattern
      log "已清理: $pattern"
    fi
  done
}

# 优化 node_modules
optimize_node_modules() {
  info "优化 node_modules..."
  
  # 如果存在 .module-cache 或类似的缓存目录，可以清理
  if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    log "已清理 node_modules 缓存"
  fi
}

# 创建最小化构建上下文
create_minimal_context() {
  info "创建最小化构建上下文..."
  
  # 确保必要的文件存在
  local required_files=(
    "package.json"
    "pnpm-lock.yaml"
    "Dockerfile.prod"
    "docker-compose.deploy.yml"
    "drizzle.config.ts"
    "next.config.ts"
    "tsconfig.json"
  )
  
  for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
      error "缺少必要文件: $file"
      exit 1
    fi
  done
  
  # 创建构建上下文目录
  local context_dir=".build-context"
  if [ -d "$context_dir" ]; then
    rm -rf "$context_dir"
  fi
  
  mkdir -p "$context_dir"
  
  # 复制必要文件到构建上下文
  cp package.json pnpm-lock.yaml Dockerfile.prod docker-compose.deploy.yml drizzle.config.ts next.config.ts tsconfig.json "$context_dir/"
  
  # 复制源代码目录
  if [ -d "app" ]; then
    cp -r app "$context_dir/"
  fi
  
  if [ -d "components" ]; then
    cp -r components "$context_dir/"
  fi
  
  if [ -d "lib" ]; then
    cp -r lib "$context_dir/"
  fi
  
  if [ -d "libs" ]; then
    cp -r libs "$context_dir/"
  fi
  
  if [ -d "public" ]; then
    cp -r public "$context_dir/"
  fi
  
  log "最小化构建上下文已创建: $context_dir"
}

# 主函数
main() {
  log "开始准备构建上下文..."
  
  cleanup_temp_files
  optimize_node_modules
  
  log "构建上下文准备完成!"
  echo "现在可以使用优化后的上下文进行Docker构建"
}

# 执行主函数
main "$@"