#!/bin/bash

# 数据库初始化脚本
# 用于在部署后自动执行数据库迁移和种子数据

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

# 确定使用哪个docker-compose命令
get_compose_cmd() {
  if command -v docker-compose &> /dev/null; then
    echo "docker-compose"
  elif docker compose version &> /dev/null; then
    echo "docker compose"
  else
    error "未找到 docker-compose 命令"
    exit 1
  fi
}

# 等待数据库服务启动
wait_for_database() {
  info "等待数据库服务启动..."
  
  local compose_cmd=$(get_compose_cmd)
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if $compose_cmd -f docker-compose.deploy.yml exec postgres pg_isready -U postgres &> /dev/null; then
      log "数据库服务已启动"
      return 0
    fi
    
    info "等待数据库启动... (尝试 $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
  done
  
  error "数据库服务启动超时"
  exit 1
}

# 执行数据库迁移
run_migrations() {
  info "执行数据库迁移..."
  
  local compose_cmd=$(get_compose_cmd)
  
  # 等待数据库服务完全启动
  sleep 5
  
  if $compose_cmd -f docker-compose.deploy.yml exec app pnpm run db:migrate; then
    log "数据库迁移完成"
  else
    error "数据库迁移失败"
    exit 1
  fi
}

# 执行数据种子
run_seeds() {
  info "执行数据种子..."
  
  local compose_cmd=$(get_compose_cmd)
  
  if $compose_cmd -f docker-compose.deploy.yml exec app pnpm run db:seed; then
    log "数据种子完成"
  else
    error "数据种子失败"
    exit 1
  fi
}

# 验证初始化结果
verify_initialization() {
  info "验证数据库初始化..."
  
  local compose_cmd=$(get_compose_cmd)
  
  # 检查是否能连接到数据库并查询数据
  if $compose_cmd -f docker-compose.deploy.yml exec postgres psql -U postgres -c "SELECT COUNT(*) FROM admins;" &> /dev/null; then
    log "数据库初始化验证通过"
  else
    error "数据库初始化验证失败"
    exit 1
  fi
}

# 主函数
main() {
  log "开始数据库初始化..."
  
  wait_for_database
  run_migrations
  run_seeds
  verify_initialization
  
  log "数据库初始化完成!"
  echo "默认管理员账户：admin / admin123（请尽快修改默认密码）"
}

# 执行主函数
main "$@"