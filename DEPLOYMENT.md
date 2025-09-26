# 生产环境部署指南

## 目录结构
```
loan/
├── docker-compose.prod.yml    # 生产环境 Docker Compose 配置
├── Dockerfile.prod           # 生产环境 Dockerfile
├── .env.example             # 环境变量示例文件
├── scripts/
│   ├── deploy.sh           # 部署脚本
│   ├── db-backup.sh        # 数据库备份恢复脚本
│   └── ...
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

# 方法2: 使用部署脚本
# 首次部署（构建镜像、运行迁移、种子数据）
./scripts/deploy.sh --build --migrate --seed

# 后续部署（仅更新应用）
./scripts/deploy.sh
```

## 数据持久化

数据库数据通过Docker卷持久化存储，不会因容器重建而丢失：
- 卷名称: `postgres_data`
- 数据位置: Docker管理的卷存储位置

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

## 快速启动脚本

项目提供了一个快速启动脚本 `scripts/quick-start.sh`，可以一键完成首次部署的所有步骤：

1. 检查并创建 `.env` 配置文件
2. 设置所有脚本的执行权限
3. 构建镜像、运行迁移和种子数据

使用方法：
```bash
./scripts/quick-start.sh
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
./scripts/update.sh

# 或使用npm脚本
npm run update
```

更新脚本会：
1. 拉取最新代码（如果是git仓库）
2. 检查是否需要重新构建镜像
3. 重新构建镜像（如果需要）
4. 重启服务

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| DB_USER | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | postgres |
| DB_NAME | 数据库名称 | loan_db |
| DB_PORT | 数据库端口 | 5433 |
| APP_PORT | 应用端口 | 3000 |

注意：在生产环境中，请务必修改默认的数据库密码，使用强密码以确保安全性。

## Docker镜像源配置

为了提高Docker镜像构建和拉取速度，建议配置阿里云镜像加速。

详细配置说明请参考 [DOCKER_MIRROR.md](DOCKER_MIRROR.md) 文档。

### 验证配置

运行测试脚本验证配置是否生效：
```bash
./scripts/test-docker-mirror.sh
```

## 注意事项

1. **数据安全**: 数据库使用Docker卷持久化存储，即使容器被删除，数据也不会丢失
2. **环境变量**: 生产环境应使用强密码，不要使用默认值
3. **备份策略**: 建议定期备份数据库，可以使用`db-backup.sh`脚本
4. **安全更新**: 定期更新基础镜像以获取安全补丁