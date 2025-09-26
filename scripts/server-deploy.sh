#!/bin/bash

# 服务器本地打包部署脚本
# 用于在服务器上直接构建和部署应用，确保数据库数据持久化

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

# 显示帮助信息
show_help() {
  echo "服务器本地打包部署脚本"
  echo ""
  echo "使用方法: $0 [options]"
  echo ""
  echo "选项:"
  echo "  --env-file <file>   环境变量文件路径 (默认: .env)"
  echo "  --tag <tag>         镜像标签 (默认: latest)"
  echo "  --no-migrate        跳过数据库迁移"
  echo "  --no-seed           跳过数据种子"
  echo "  --help              显示帮助信息"
  echo ""
  echo "示例:"
  echo "  $0"
  echo "  $0 --tag v1.0.0"
}

# 默认值
ENV_FILE=".env"
TAG="latest"
RUN_MIGRATE=true
RUN_SEED=true

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --no-migrate)
      RUN_MIGRATE=false
      shift
      ;;
    --no-seed)
      RUN_SEED=false
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

# 检查Docker BuildKit支持
check_buildkit_support() {
  info "检查Docker BuildKit支持..."
  
  if docker buildx version &> /dev/null; then
    log "Docker BuildKit可用"
    return 0
  else
    warn "Docker BuildKit不可用，将使用传统构建方式"
    return 1
  fi
}

# 检查环境变量文件
check_env_file() {
  if [ ! -f "$ENV_FILE" ]; then
    error "环境变量文件不存在: $ENV_FILE"
    echo "请创建环境变量文件或使用 --env-file 指定文件路径"
    exit 1
  fi
  
  info "使用环境变量文件: $ENV_FILE"
}

# 构建Docker镜像
build_image() {
  info "在服务器上构建Docker镜像..."
  
  # 设置Docker镜像源加速
  local registry_mirror="${DOCKER_REGISTRY_MIRROR:-https://pw6rk6ai.mirror.aliyuncs.com}"
  
  # 检查BuildKit支持
  if check_buildkit_support; then
    # 使用BuildKit构建
    DOCKER_BUILDKIT=1 docker build \
      --build-arg BUILDKIT_INLINE_CACHE=1 \
      --registry-mirror="$registry_mirror" \
      -t "loan-app:$TAG" \
      -f Dockerfile.prod .
  else
    # 使用传统方式构建
    docker build \
      --registry-mirror="$registry_mirror" \
      -t "loan-app:$TAG" \
      -f Dockerfile.prod .
  fi
  
  log "Docker镜像构建完成: loan-app:$TAG"
}

# 停止当前服务
stop_services() {
  info "停止当前服务..."
  
  # 检查服务是否正在运行
  if docker-compose -f docker-compose.deploy.yml ps | grep -q "Up"; then
    docker-compose -f docker-compose.deploy.yml down
    log "服务已停止"
  else
    info "服务未运行"
  fi
}

# 启动服务
start_services() {
  info "启动服务..."
  
  # 使用环境变量文件和部署配置文件启动服务
  docker-compose -f docker-compose.deploy.yml --env-file "$ENV_FILE" up -d
  
  log "服务启动完成"
}

# 等待服务启动
wait_for_services() {
  info "等待服务启动..."
  
  # 等待一段时间让服务启动
  sleep 10
  
  # 检查服务状态
  if docker-compose -f docker-compose.deploy.yml ps | grep -q "Up"; then
    log "服务运行正常"
  else
    error "服务启动失败"
    echo "查看日志以获取更多信息:"
    echo "  docker-compose -f docker-compose.deploy.yml logs"
    exit 1
  fi
}

# 运行数据库迁移
run_migrations() {
  if [ "$RUN_MIGRATE" = true ]; then
    info "运行数据库迁移..."
    
    # 等待数据库启动
    sleep 10
    
    # 运行迁移
    docker-compose -f docker-compose.deploy.yml exec app pnpm run db:migrate
    log "数据库迁移完成"
  else
    info "跳过数据库迁移"
  fi
}

# 运行数据种子
run_seeds() {
  if [ "$RUN_SEED" = true ]; then
    info "运行数据种子..."
    docker-compose -f docker-compose.deploy.yml exec app pnpm run db:seed
    log "数据种子运行完成"
  else
    info "跳过数据种子"
  fi
}

# 显示服务状态
show_status() {
  info "服务状态:"
  docker-compose -f docker-compose.deploy.yml ps
}

# 主函数
main() {
  log "开始服务器本地打包部署..."
  
  check_dependencies
  check_env_file
  build_image
  stop_services
  start_services
  wait_for_services
  run_migrations
  run_seeds
  show_status
  
  log "服务器本地打包部署完成!"
  echo "应用地址: http://localhost:$(grep APP_PORT "$ENV_FILE" | cut -d '=' -f2)"
  echo "数据库地址: localhost:$(grep DB_PORT "$ENV_FILE" | cut -d '=' -f2)"
  
  info "数据库数据已持久化存储，下次重新运行不会丢失数据"
}

# 执行主函数
main "$@"