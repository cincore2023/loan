# Docker镜像源配置说明

## 目录

1. [概述](#概述)
2. [配置方法](#配置方法)
3. [验证配置](#验证配置)
4. [故障排除](#故障排除)

## 概述

为了提高Docker镜像的拉取和构建速度，我们配置了阿里云镜像加速服务。镜像地址为: `https://pw6rk6ai.mirror.aliyuncs.com`

## 配置方法

### 方法1: 系统级配置（推荐）

适用于有root权限的服务器环境:

```bash
# 运行配置脚本
sudo ./scripts/configure-docker-mirror.sh
```

此方法会:
- 修改 `/etc/docker/daemon.json` 配置文件
- 重启Docker服务
- 永久生效

### 方法2: 环境变量配置

适用于没有root权限的环境:

```bash
# 设置环境变量
export DOCKER_REGISTRY_MIRROR="https://pw6rk6ai.mirror.aliyuncs.com"
export DOCKER_BUILDKIT=1

# 或者运行我们提供的脚本
source ./scripts/set-docker-mirror-env.sh
```

此方法会:
- 仅在当前shell会话中生效
- 不需要root权限

### 方法3: 命令行参数

在构建时直接指定镜像源:

```bash
DOCKER_BUILDKIT=1 docker build --registry-mirror=https://pw6rk6ai.mirror.aliyuncs.com -t loan-app -f Dockerfile.prod .
```

## 验证配置

### 使用测试脚本

```bash
./scripts/test-docker-mirror.sh
```

### 手动验证

```bash
# 检查Docker信息
docker info | grep -i registry

# 测试拉取镜像的速度
time docker pull hello-world
```

## 故障排除

### 问题1: 镜像源配置未生效

**解决方案:**
1. 检查Docker daemon是否重启
2. 验证配置文件格式是否正确
3. 检查网络连接是否正常

### 问题2: 没有root权限无法配置

**解决方案:**
1. 使用环境变量方法
2. 联系系统管理员配置系统级镜像源

### 问题3: 构建速度仍然很慢

**解决方案:**
1. 验证镜像源地址是否正确
2. 检查网络连接
3. 尝试其他镜像源

## 安装Docker Buildx

Docker Buildx是Docker的下一代构建工具，提供更好的性能和功能。

### 使用npm脚本安装

```bash
npm run docker:install-buildx
```

### 手动安装

```bash
# 运行我们提供的安装脚本
./scripts/install-docker-buildx.sh
```

### 验证安装

```bash
# 检查Buildx版本
docker buildx version

# 检查构建器实例
docker buildx ls
```

安装完成后，部署脚本会自动使用BuildKit功能来加速镜像构建。

## 安装jq工具

jq是一个轻量级且灵活的命令行JSON处理器，在配置Docker daemon时可以智能合并现有配置。

### 使用npm脚本安装

```bash
npm run docker:install-jq
```

### 手动安装

```bash
# 运行我们提供的安装脚本
./scripts/install-jq.sh
```

### 验证安装

```bash
# 检查jq版本
jq --version
```

## 相关脚本

- `scripts/configure-docker-mirror.sh` - 系统级配置脚本
- `scripts/set-docker-mirror-env.sh` - 环境变量配置脚本
- `scripts/test-docker-mirror.sh` - 配置验证脚本