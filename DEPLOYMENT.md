# 生产环境部署指南

## 目录结构
```
loan/
├── Dockerfile                # Dockerfile
├── .env.example             # 环境变量示例文件
├── scripts/
│   ├── server-deploy.sh      # 服务器本地打包部署脚本
│   ├── db-backup.sh          # 数据库备份恢复脚本
│   └── init-database.sh      # 数据库初始化脚本
└── ...
```

## 部署指南

## 概述

本项目支持多种部署方式，包括本地开发部署和生产环境部署。部署过程使用 Docker 和 Docker Compose 来确保环境一致性。

## 部署方式

### 1. 本地开发部署

```bash
# 启动开发服务器
pnpm dev

# 或使用 Docker 部署开发环境
docker-compose up
```

### 2. 生产环境部署

```bash
# 构建生产镜像
docker build -t loan-app .

# 启动生产环境服务
docker-compose -f docker-compose.deploy.yml up -d
```

## 环境配置

### 环境变量文件

生产环境部署需要配置以下环境变量文件：

1. `.env.production` - 生产环境配置文件
2. `.env` - 通用配置文件

### 数据库配置

```bash
# 数据库连接配置
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=loan_db
DB_PORT=5433
```

### 应用配置

```bash
# 应用配置
APP_PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-secret-key-change-this-in-production
```

**重要安全提醒**：请务必在生产环境中将 `JWT_SECRET` 更改为一个安全的随机字符串，不要使用默认值。

## 部署脚本

项目提供了自动化部署脚本以简化部署过程：

### 服务器部署脚本

```bash
# 服务器部署
./scripts/server-deploy.sh

# 指定基础镜像部署
./scripts/server-deploy.sh --base-image node:18-alpine
```

## 部署验证

### 服务状态检查

```bash
# 检查服务运行状态
docker-compose -f docker-compose.deploy.yml ps

# 查看服务日志
docker-compose -f docker-compose.deploy.yml logs
```

### 健康检查

```bash
# 检查应用是否正常运行
curl http://localhost:3000/api/health
```

## 故障排除

### 常见问题

1. **端口冲突**：确保 3000 端口未被占用
2. **数据库连接失败**：检查数据库配置和网络连接
3. **权限问题**：确保 Docker 和相关文件具有正确权限

### 日志查看

```bash
# 查看应用日志
docker logs loan_app

# 查看数据库日志
docker logs loan_postgres
```

通过以上步骤，您可以成功部署本项目到不同的环境中。建议在生产环境中使用自动化部署脚本以确保部署过程的一致性和可靠性.