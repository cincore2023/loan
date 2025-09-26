#!/bin/bash

# jq工具安装脚本
# 用于安装jq JSON处理工具

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

# 检查是否已安装jq
check_jq() {
  if command -v jq &> /dev/null; then
    log "jq已安装"
    jq --version
    return 0
  else
    info "jq未安装"
    return 1
  fi
}

# 安装jq
install_jq() {
  info "安装jq..."
  
  # 检测操作系统类型
  if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y jq
  elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum install -y jq
  elif command -v dnf &> /dev/null; then
    # Fedora
    dnf install -y jq
  elif command -v apk &> /dev/null; then
    # Alpine
    apk add jq
  else
    error "不支持的操作系统包管理器"
    exit 1
  fi
  
  log "jq安装完成"
}

# 主函数
main() {
  log "开始安装jq..."
  
  if check_jq; then
    info "jq已经安装，无需重复安装"
  else
    install_jq
  fi
  
  # 验证安装
  if check_jq; then
    log "jq安装验证通过"
  else
    error "jq安装失败"
    exit 1
  fi
  
  log "jq安装完成!"
}

# 执行主函数
main "$@"