#!/bin/bash

# Docker镜像源配置脚本
# 用于配置Docker使用阿里云镜像加速

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

# 检查是否为root用户
check_root() {
  if [ "$EUID" -ne 0 ]; then
    error "请以root用户运行此脚本"
    exit 1
  fi
}

# 配置Docker daemon
configure_docker_daemon() {
  local daemon_config="/etc/docker/daemon.json"
  
  info "配置Docker daemon镜像源..."
  
  # 创建Docker目录（如果不存在）
  mkdir -p /etc/docker
  
  # 如果配置文件已存在，备份它
  if [ -f "$daemon_config" ]; then
    info "备份现有配置文件..."
    cp "$daemon_config" "${daemon_config}.backup.$(date +%Y%m%d_%H%M%S)"
  fi
  
  # 写入新的配置
  cat > "$daemon_config" << EOF
{
  "registry-mirrors": ["https://pw6rk6ai.mirror.aliyuncs.com"]
}
EOF
  
  log "Docker daemon配置完成"
}

# 重启Docker服务
restart_docker() {
  info "重启Docker服务..."
  
  # 尝试不同的系统服务管理器
  if command -v systemctl &> /dev/null; then
    systemctl restart docker
  elif command -v service &> /dev/null; then
    service docker restart
  else
    error "无法找到合适的服务管理器"
    exit 1
  fi
  
  log "Docker服务重启完成"
}

# 验证配置
verify_configuration() {
  info "验证配置..."
  
  # 等待Docker服务启动
  sleep 5
  
  # 检查Docker信息
  if docker info &> /dev/null; then
    log "Docker服务运行正常"
    
    # 显示镜像源配置
    echo "当前Docker镜像源配置:"
    docker info | grep -i registry
  else
    error "Docker服务启动失败"
    exit 1
  fi
}

# 主函数
main() {
  log "开始配置Docker镜像源..."
  
  # 检查root权限
  check_root
  
  # 配置Docker daemon
  configure_docker_daemon
  
  # 重启Docker服务
  restart_docker
  
  # 验证配置
  verify_configuration
  
  log "Docker镜像源配置完成!"
  echo "现在可以正常部署应用了"
}

# 执行主函数
main "$@"