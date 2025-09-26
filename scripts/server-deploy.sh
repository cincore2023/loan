#!/bin/bash

# 服务器部署脚本
# 该脚本会构建 Docker 镜像并部署到服务器

set -e

# 默认基础镜像
DEFAULT_BASE_IMAGE="node:18-alpine"

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

# 显示帮助信息
show_help() {
    echo "服务器部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help            显示帮助信息"
    echo "  --base-image <image>  基础镜像地址 (默认: $DEFAULT_BASE_IMAGE)"
    echo ""
    echo "示例:"
    echo "  $0"
    echo "  $0 --base-image node:18-alpine"
}

# 解析命令行参数
parse_args() {
    BASE_IMAGE="$DEFAULT_BASE_IMAGE"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --base-image)
                BASE_IMAGE="$2"
                shift 2
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 检查 Docker 是否已安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        log_info "请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose 未安装"
        log_info "请先安装 docker-compose"
        exit 1
    fi
}

# 构建 Docker 镜像
build_image() {
    log_info "正在构建 Docker 镜像..."
    log_info "使用基础镜像: $BASE_IMAGE"
    
    # 构建镜像
    docker build \
        --build-arg BASE_IMAGE="$BASE_IMAGE" \
        -t loan-app \
        .
    
    log_info "Docker 镜像构建完成"
}

# 部署服务
deploy_services() {
    log_info "正在部署服务..."
    
    # 停止现有服务
    docker-compose -f docker-compose.deploy.yml down
    
    # 启动服务
    docker-compose -f docker-compose.deploy.yml up -d
    
    log_info "服务部署完成"
}

# 验证部署
verify_deployment() {
    log_info "正在验证部署..."
    
    # 等待服务启动
    sleep 10
    
    # 检查服务状态
    if docker-compose -f docker-compose.deploy.yml ps | grep -q "Up"; then
        log_info "服务部署验证成功"
    else
        log_error "服务部署验证失败"
        docker-compose -f docker-compose.deploy.yml ps
        exit 1
    fi
}

# 主函数
main() {
    log_info "开始服务器部署"
    
    parse_args "$@"
    check_docker
    build_image
    deploy_services
    verify_deployment
    
    log_info "服务器部署完成"
    log_info "访问地址: http://localhost:3000"
}

# 执行主函数
main "$@"