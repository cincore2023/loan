#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./deploy.sh [options]
# 选项:
#   --env <env>     部署环境 (prod, staging, dev) 默认: prod
#   --build         重新构建镜像
#   --migrate       运行数据库迁移
#   --seed          运行数据种子
#   --help          显示帮助信息

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认值
ENV="prod"
BUILD=false
MIGRATE=false
SEED=false

# 日志函数
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

info() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# 显示帮助信息
show_help() {
  echo "生产环境部署脚本"
  echo ""
  echo "使用方法: $0 [options]"
  echo ""
  echo "选项:"
  echo "  --env <env>     部署环境 (prod, staging, dev) 默认: prod"
  echo "  --build         重新构建镜像"
  echo "  --migrate       运行数据库迁移"
  echo "  --seed          运行数据种子"
  echo "  --help          显示帮助信息"
  echo ""
  echo "示例:"
  echo "  $0 --build --migrate --seed"
  echo "  $0 --env staging --build"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENV="$2"
      shift 2
      ;;
    --build)
      BUILD=true
      shift
      ;;
    --migrate)
      MIGRATE=true
      shift
      ;;
    --seed)
      SEED=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      error "未知选项: $1"
      show_help
      exit 1
      ;;
  esac
done

# 检查必要工具
check_dependencies() {
  info "检查依赖..."
  
  if ! command -v docker &> /dev/null; then
    error "未找到 Docker。请先安装 Docker。"
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    error "未找到 docker-compose。请先安装 docker-compose。"
    exit 1
  fi
  
  log "依赖检查通过"
}

# 构建镜像
build_images() {
  if [ "$BUILD" = true ]; then
    info "构建 Docker 镜像..."
    docker-compose -f docker-compose.prod.yml build
    log "Docker 镜像构建完成"
  else
    info "跳过镜像构建"
  fi
}

# 启动服务
start_services() {
  info "启动服务..."
  docker-compose -f docker-compose.prod.yml up -d
  log "服务启动完成"
}

# 运行数据库迁移
run_migrations() {
  if [ "$MIGRATE" = true ]; then
    info "运行数据库迁移..."
    sleep 10  # 等待数据库启动
    docker-compose -f docker-compose.prod.yml exec app pnpm run db:migrate
    log "数据库迁移完成"
  else
    info "跳过数据库迁移"
  fi
}

# 运行数据种子
run_seeds() {
  if [ "$SEED" = true ]; then
    info "运行数据种子..."
    docker-compose -f docker-compose.prod.yml exec app pnpm run db:seed
    log "数据种子运行完成"
  else
    info "跳过数据种子"
  fi
}

# 显示服务状态
show_status() {
  info "服务状态:"
  docker-compose -f docker-compose.prod.yml ps
}

# 主函数
main() {
  log "开始部署到 $ENV 环境"
  
  check_dependencies
  build_images
  start_services
  run_migrations
  run_seeds
  show_status
  
  log "部署完成!"
  info "应用地址: http://localhost:${APP_PORT:-3000}"
  info "数据库地址: localhost:${DB_PORT:-5433}"
}

# 执行主函数
main "$@"