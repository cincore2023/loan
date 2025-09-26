#!/bin/bash

# 部署到远程服务器的脚本
# 使用方法: ./scripts/deploy-to-server.sh

set -e

# 服务器信息（请根据实际情况修改）
SERVER_IP="42.121.104.68"
SERVER_USER="root"
PROJECT_NAME="loan-app"

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

# 检查必要工具
check_dependencies() {
  info "检查依赖..."
  
  if ! command -v rsync &> /dev/null; then
    error "未找到 rsync。请先安装 rsync。"
    exit 1
  fi
  
  log "依赖检查通过"
}

# 上传项目到服务器
upload_project() {
  info "上传项目到服务器..."
  
  # 创建远程目录
  ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p /root/${PROJECT_NAME}"
  
  # 同步项目文件到服务器（排除node_modules和.git目录）
  rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' . "${SERVER_USER}@${SERVER_IP}:/root/${PROJECT_NAME}/"
  
  log "项目上传完成"
}

# 在服务器上执行部署
deploy_on_server() {
  info "在服务器上执行部署..."
  
  ssh "${SERVER_USER}@${SERVER_IP}" "cd /root/${PROJECT_NAME} && chmod +x ./scripts/server-deploy.sh && ./scripts/server-deploy.sh"
  
  log "服务器部署完成"
}

# 显示部署后的服务信息
show_service_info() {
  info "服务信息:"
  echo "应用地址: http://${SERVER_IP}:3000"
  echo "数据库地址: ${SERVER_IP}:5433"
}

# 主函数
main() {
  log "开始部署到服务器..."
  
  check_dependencies
  upload_project
  deploy_on_server
  show_service_info
  
  log "部署完成!"
}

# 执行主函数
main "$@"