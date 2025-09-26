# 服务器本地打包部署指南

## 目录

1. [概述](#概述)
2. [部署流程](#部署流程)
3. [使用方法](#使用方法)
4. [数据持久化](#数据持久化)
5. [故障排除](#故障排除)

## 概述

本文档介绍了如何在服务器上直接构建和部署应用，无需使用镜像仓库。该方案确保数据库数据持久化存储，不会因应用更新而丢失。

## 部署流程

1. 在服务器上克隆代码仓库
2. 配置环境变量文件
3. 运行服务器部署脚本
4. 脚本会自动构建镜像并启动服务
5. 数据库数据通过Docker卷持久化存储

## 使用方法

### 1. 准备服务器环境

确保服务器上已安装以下软件：
- Docker
- Docker Compose
- Git
- Node.js (可选，用于运行迁移和种子脚本)

### 2. 克隆代码仓库

```bash
git clone <your-repository-url>
cd loan
```

### 3. 配置环境变量

```bash
# 复制环境变量文件模板
cp .env.example .env

# 编辑环境变量文件
vim .env
```

确保设置合适的数据库密码和其他配置。

### 4. 运行部署脚本

#### 使用npm脚本
```bash
# 基本部署（构建镜像并启动服务）
npm run server:deploy

# 指定镜像标签
npm run server:deploy -- --tag v1.0.0

# 跳过数据库迁移和种子
npm run server:deploy -- --no-migrate --no-seed
```

#### 直接使用脚本
```bash
# 基本部署
./scripts/server-deploy.sh

# 指定镜像标签
./scripts/server-deploy.sh --tag v1.0.0

# 使用自定义环境变量文件
./scripts/server-deploy.sh --env-file .env.prod

# 跳过数据库迁移和种子
./scripts/server-deploy.sh --no-migrate --no-seed
```

### 5. 验证部署

```bash
# 查看服务状态
docker-compose -f docker-compose.deploy.yml ps

# 查看应用日志
docker-compose -f docker-compose.deploy.yml logs app

# 查看数据库日志
docker-compose -f docker-compose.deploy.yml logs postgres
```

## 数据持久化

数据库数据通过Docker卷进行持久化存储，确保数据不会因容器重建或应用更新而丢失。

### 持久化机制

1. **Docker卷**: 数据库存储在命名卷`postgres_data`中
2. **卷持久性**: 即使删除容器，卷中的数据仍然保留
3. **数据备份**: 提供备份和恢复脚本

### 数据备份与恢复

```bash
# 备份数据库
npm run db:backup

# 恢复数据库
npm run db:restore backup_20230101_120000.sql
```

## 故障排除

### 问题1: 构建失败

**可能原因**: 网络问题或依赖下载失败
**解决方案**:
1. 检查网络连接
2. 配置Docker镜像源加速
3. 重新运行部署脚本

### 问题2: 服务无法启动

**可能原因**: 端口冲突或配置错误
**解决方案**:
1. 检查端口占用情况
2. 验证环境变量配置
3. 查看服务日志

```bash
# 查看服务日志
docker-compose -f docker-compose.deploy.yml logs
```

### 问题3: 数据库连接失败

**可能原因**: 数据库未启动或连接配置错误
**解决方案**:
1. 检查数据库服务状态
2. 验证数据库连接字符串
3. 确认数据库用户和密码

### 问题4: 数据丢失

**可能原因**: Docker卷被意外删除
**解决方案**:
1. 使用备份恢复数据
2. 检查卷管理策略
3. 定期备份重要数据

## 最佳实践

### 1. 环境变量管理

1. 为不同环境使用不同的环境变量文件
2. 不要将敏感信息硬编码在代码中
3. 定期更新密码和密钥

### 2. 版本控制

1. 为每次部署使用不同的镜像标签
2. 在Git中记录部署版本
3. 保留旧版本以便回滚

### 3. 监控和日志

1. 定期检查服务状态
2. 设置日志轮转避免磁盘满载
3. 配置监控告警

### 4. 安全考虑

1. 限制对部署脚本的访问权限
2. 定期更新基础镜像
3. 使用非root用户运行应用