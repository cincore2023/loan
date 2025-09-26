#!/bin/bash

# 测试 Docker 环境脚本
# 该脚本会测试 Docker 环境配置是否正确

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

# 检查 Docker 是否已安装
check_docker_installed() {
    log_info "检查 Docker 是否已安装..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        return 1
    fi
    
    log_info "Docker 版本: $(docker --version)"
    return 0
}

# 检查 docker-compose 是否已安装
check_docker_compose_installed() {
    log_info "检查 docker-compose 是否已安装..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose 未安装"
        return 1
    fi
    
    log_info "docker-compose 版本: $(docker-compose --version)"
    return 0
}

# 检查 Docker 服务是否运行
check_docker_running() {
    log_info "检查 Docker 服务是否运行..."
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        return 1
    fi
    
    log_info "Docker 服务运行正常"
    return 0
}

# 检查 Docker 镜像加速配置
check_docker_mirror() {
    log_info "检查 Docker 镜像加速配置..."
    
    local registry_mirror="https://docker.mirrors.ustc.edu.cn"
    
    if docker info | grep -q "Registry Mirrors"; then
        log_info "Docker 镜像加速已配置"
        docker info | grep -A 5 "Registry Mirrors"
    else
        log_warn "Docker 镜像加速未配置"
        log_info "建议配置镜像加速以提高镜像拉取速度"
        log_info "可以使用以下命令配置:"
        log_info "  sudo ./scripts/configure-server-docker-mirror.sh"
    fi
}

# 测试镜像拉取
test_image_pull() {
    log_info "测试镜像拉取..."
    
    local test_image="hello-world:latest"
    
    # 拉取测试镜像
    if docker pull "$test_image"; then
        log_info "镜像拉取测试成功"
        
        # 运行测试镜像
        if docker run --rm "$test_image"; then
            log_info "镜像运行测试成功"
        else
            log_error "镜像运行测试失败"
            return 1
        fi
    else
        log_error "镜像拉取测试失败"
        return 1
    fi
    
    return 0
}

# 主函数
main() {
    log_info "开始测试 Docker 环境"
    
    # 检查各项配置
    check_docker_installed || exit 1
    check_docker_compose_installed || exit 1
    check_docker_running || exit 1
    check_docker_mirror
    test_image_pull || exit 1
    
    log_info "Docker 环境测试完成"
    log_info "环境配置正常，可以开始构建和部署"
}

# 执行主函数
main "$@"