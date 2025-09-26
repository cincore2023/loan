#!/bin/bash

# 服务器Docker镜像源配置脚本
# 用于在服务器上配置Docker使用镜像加速地址

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
  local registry_mirror="https://docker.xuanyuan.me"
  
  info "配置Docker daemon镜像源..."
  
  # 创建Docker目录（如果不存在）
  mkdir -p /etc/docker
  
  # 如果配置文件已存在，备份它
  if [ -f "$daemon_config" ]; then
    info "备份现有配置文件..."
    cp "$daemon_config" "${daemon_config}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # 尝试解析现有的JSON配置
    if command -v jq &> /dev/null; then
      # 使用jq来合并配置
      info "使用jq合并现有配置..."
      # 创建新的配置（包含镜像源）
      echo "{\"registry-mirrors\": [\"$registry_mirror\"]}" > /tmp/docker-config-new.json
      
      # 合并现有配置和新配置
      jq -s '.[0] * .[1]' "$daemon_config" /tmp/docker-config-new.json > /tmp/docker-config-merged.json
      
      # 移动合并后的配置
      mv /tmp/docker-config-merged.json "$daemon_config"
      rm /tmp/docker-config-new.json
    else
      # 如果没有jq，直接备份并创建新配置
      warn "未找到jq工具，将覆盖现有配置"
      cat > "$daemon_config" << EOF
{
  "registry-mirrors": ["$registry_mirror"]
}
EOF
    fi
  else
    # 创建新的配置
    cat > "$daemon_config" << EOF
{
  "registry-mirrors": ["$registry_mirror"]
}
EOF
  fi
  
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
  log "开始配置服务器Docker镜像源..."
  
  # 检查root权限
  check_root
  
  # 配置Docker daemon
  configure_docker_daemon
  
  # 重启Docker服务
  restart_docker
  
  # 验证配置
  verify_configuration
  
  log "服务器Docker镜像源配置完成!"
  echo "现在可以正常部署应用了"
}

# 执行主函数
main "$@"