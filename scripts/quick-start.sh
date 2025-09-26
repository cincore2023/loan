#!/bin/bash

# 快速启动开发环境脚本
# 该脚本会自动配置开发环境并启动服务

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

# 检查命令是否存在
command_exists() {
    command -v "$1" &> /dev/null
}

# 检查 Node.js 和 pnpm
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command_exists node; then
        log_error "Node.js 未安装"
        log_info "请先安装 Node.js"
        exit 1
    fi
    
    if ! command_exists pnpm; then
        log_error "pnpm 未安装"
        log_info "请先安装 pnpm: npm install -g pnpm"
        exit 1
    fi
    
    if ! command_exists docker; then
        log_error "Docker 未安装"
        log_info "请先安装 Docker"
        exit 1
    fi
    
    log_info "依赖检查通过"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    pnpm install
    log_info "项目依赖安装完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 启动数据库容器
    docker-compose up -d postgres
    
    # 等待数据库启动
    log_info "等待数据库启动..."
    sleep 10
    
    # 运行数据库迁移
    pnpm run db:migrate
    
    # 运行数据库种子
    pnpm run db:seed
    
    log_info "数据库初始化完成"
}

# 启动开发服务器
start_dev_server() {
    log_info "启动开发服务器..."
    
    # 启动所有服务
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    log_info "开发环境已启动"
    log_info "访问地址: http://localhost:3000"
}

# 主函数
main() {
    log_info "开始快速启动开发环境"
    
    check_dependencies
    install_dependencies
    init_database
    start_dev_server
    
    log_info "开发环境启动完成"
    log_info "请访问 http://localhost:3000 开始使用"
}

# 执行主函数
main "$@"