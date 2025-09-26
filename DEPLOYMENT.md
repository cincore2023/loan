# 生产环境部署指南

## 目录结构
```
loan/
├── docker-compose.prod.yml    # 生产环境 Docker Compose 配置
├── Dockerfile.prod           # 生产环境 Dockerfile
├── .env.example             # 环境变量示例文件
├── scripts/
│   ├── server-deploy.sh      # 服务器本地打包部署脚本
│   ├── db-backup.sh          # 数据库备份恢复脚本
│   ├── quick-start.sh        # 快速启动脚本
│   ├── configure-docker-mirror.sh  # Docker镜像源配置脚本
│   ├── set-docker-mirror-env.sh    # 环境变量配置脚本
│   └── test-docker-mirror.sh       # 镜像源测试脚本
└── ...
```

## 部署步骤

### 1. 环境准备
确保服务器上已安装以下软件：
- Docker
- Docker Compose

### 2. 配置环境变量
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
vim .env
```

### 3. 部署应用
```bash
# 给脚本添加执行权限
chmod +x scripts/*.sh

# 方法1: 使用快速启动脚本（推荐用于首次部署）
./scripts/quick-start.sh

# 方法2: 使用服务器部署脚本
./scripts/server-deploy.sh
```

## Docker镜像源配置

为了提高Docker镜像构建和拉取速度，建议配置阿里云镜像加速。

详细配置说明请参考 [DOCKER_MIRROR.md](DOCKER_MIRROR.md) 文档。

## 快速启动脚本

项目提供了一个快速启动脚本 `scripts/quick-start.sh`，可以一键完成首次部署的所有步骤：

1. 检查并创建 `.env` 配置文件
2. 设置所有脚本的执行权限
3. 构建镜像、运行迁移和种子数据

使用方法：
```bash
./scripts/quick-start.sh
```

## 服务器本地打包部署

如果您没有镜像仓库，可以直接在服务器上打包和部署应用：

- 服务器本地构建镜像
- 数据库数据持久化存储
- 简化部署流程

详细说明请参考 [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) 文档。

## 数据库备份与恢复

### 备份数据库
```bash
# 创建备份
./scripts/db-backup.sh backup

# 创建指定名称的备份
./scripts/db-backup.sh backup my_backup.sql
```

### 恢复数据库
```bash
# 恢复备份
./scripts/db-backup.sh restore my_backup.sql
```

### 列出备份
```bash
./scripts/db-backup.sh list
```

## 常用操作

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 查看应用日志
docker-compose -f docker-compose.prod.yml logs app

# 查看数据库日志
docker-compose -f docker-compose.prod.yml logs postgres
```

### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart app
```

### 更新应用

使用更新脚本可以在不丢失数据的情况下更新应用：
```bash
# 更新应用
./scripts/server-deploy.sh

# 更新应用（指定标签）
./scripts/server-deploy.sh --tag v1.0.0
```

更新脚本会：
1. 在服务器上构建新的Docker镜像
2. 重启服务以使用新镜像

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| DB_USER | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | postgres |
| DB_NAME | 数据库名称 | loan_db |
| DB_PORT | 数据库端口 | 5433 |
| APP_PORT | 应用端口 | 3000 |

注意：在生产环境中，请务必修改默认的数据库密码，使用强密码以确保安全性。