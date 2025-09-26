#!/bin/bash

# 配置服务器 Docker 镜像加速脚本
# 该脚本会修改 /etc/docker/daemon.json 文件以配置 Docker 镜像加速

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 权限运行
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        log_info "请使用 sudo 运行此脚本:"
        log_info "  sudo $0"
        exit 1
    fi
}

# 检查 Docker 是否已安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        log_info "请先安装 Docker"
        exit 1
    fi
}

# 配置 Docker 镜像加速
configure_docker_mirror() {
    local daemon_json="/etc/docker/daemon.json"
    local registry_mirror="https://docker.mirrors.ustc.edu.cn"
    
    log_info "正在配置 Docker 镜像加速..."
    
    # 备份原始配置文件
    if [[ -f "$daemon_json" ]]; then
        log_info "备份原始配置文件到 $daemon_json.backup"
        cp "$daemon_json" "$daemon_json.backup"
    fi
    
    # 创建或更新 daemon.json 配置文件
    cat > "$daemon_json" << EOF
{
  "registry-mirrors": [
    "$registry_mirror"
  ]
}
EOF
    
    log_info "Docker 镜像加速配置已完成"
    log_info "配置的镜像加速地址: $registry_mirror"
}

# 重启 Docker 服务
restart_docker() {
    log_info "正在重启 Docker 服务..."
    
    # 尝试不同的系统服务管理器
    if command -v systemctl &> /dev/null; then
        systemctl restart docker
    elif command -v service &> /dev/null; then
        service docker restart
    else
        log_error "无法找到合适的服务管理器来重启 Docker"
        log_info "请手动重启 Docker 服务"
        exit 1
    fi
    
    if [[ $? -eq 0 ]]; then
        log_info "Docker 服务重启成功"
    else
        log_error "Docker 服务重启失败"
        exit 1
    fi
}

# 验证配置
verify_configuration() {
    log_info "正在验证 Docker 配置..."
    
    # 等待 Docker 服务启动
    sleep 3
    
    # 检查镜像加速配置
    if docker info | grep -q "Registry Mirrors"; then
        log_info "Docker 镜像加速配置验证成功"
        docker info | grep -A 5 "Registry Mirrors"
    else
        log_warn "无法验证镜像加速配置，请手动检查"
    fi
}

# 主函数
main() {
    log_info "开始配置服务器 Docker 镜像加速"
    
    check_root
    check_docker
    configure_docker_mirror
    restart_docker
    verify_configuration
    
    log_info "服务器 Docker 镜像加速配置完成"
    log_info "建议测试镜像拉取速度以验证配置效果"
}

# 执行主函数
main "$@"