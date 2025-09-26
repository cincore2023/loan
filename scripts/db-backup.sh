#!/bin/bash

# 数据库备份和恢复脚本
# 使用方法: 
#   备份: ./db-backup.sh backup [filename]
#   恢复: ./db-backup.sh restore [filename]

set -e

# 配置
CONTAINER_NAME="loan_postgres"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-loan_db}"
BACKUP_DIR="./backups"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

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
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# 备份数据库
backup() {
  local filename="${1:-backup_$(date +%Y%m%d_%H%M%S).sql}"
  local filepath="$BACKUP_DIR/$filename"
  
  info "开始备份数据库..."
  
  # 执行备份
  docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$filepath"
  
  if [ $? -eq 0 ]; then
    log "数据库备份成功: $filepath"
    echo "文件大小: $(du -h "$filepath" | cut -f1)"
  else
    error "数据库备份失败"
    exit 1
  fi
}

# 恢复数据库
restore() {
  local filename="$1"
  local filepath="$BACKUP_DIR/$filename"
  
  if [ ! -f "$filepath" ]; then
    error "备份文件不存在: $filepath"
    exit 1
  fi
  
  info "开始恢复数据库..."
  warn "这将覆盖现有数据，确定要继续吗? (y/N)"
  read -r confirm
  
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    info "操作已取消"
    exit 0
  fi
  
  # 停止应用服务
  docker-compose -f docker-compose.prod.yml stop app
  
  # 恢复数据库
  docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$filepath"
  
  if [ $? -eq 0 ]; then
    log "数据库恢复成功"
  else
    error "数据库恢复失败"
    exit 1
  fi
  
  # 重新启动应用服务
  docker-compose -f docker-compose.prod.yml start app
}

# 显示帮助
show_help() {
  echo "数据库备份和恢复脚本"
  echo ""
  echo "使用方法:"
  echo "  $0 backup [filename]    备份数据库"
  echo "  $0 restore [filename]   恢复数据库"
  echo "  $0 list                 列出备份文件"
  echo "  $0 help                 显示帮助"
  echo ""
  echo "示例:"
  echo "  $0 backup"
  echo "  $0 backup my_backup.sql"
  echo "  $0 restore backup_20230101_120000.sql"
}

# 列出备份文件
list_backups() {
  info "备份文件列表:"
  if [ -d "$BACKUP_DIR" ]; then
    ls -lh "$BACKUP_DIR"
  else
    echo "备份目录不存在"
  fi
}

# 主函数
main() {
  case "$1" in
    backup)
      backup "$2"
      ;;
    restore)
      restore "$2"
      ;;
    list)
      list_backups
      ;;
    help)
      show_help
      ;;
    *)
      show_help
      exit 1
      ;;
  esac
}

# 执行主函数
main "$@"