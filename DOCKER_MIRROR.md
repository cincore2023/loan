# Docker镜像源配置说明

## 目录

1. [概述](#概述)
2. [配置方法](#配置方法)
3. [验证配置](#验证配置)
4. [安装Docker Buildx](#安装Docker-Buildx)
5. [安装jq工具](#安装jq工具)
6. [故障排除](#故障排除)

## 概述

为了提高Docker镜像的拉取和构建速度，我们配置了阿里云镜像加速服务。镜像地址为: `https://pw6rk6ai.mirror.aliyuncs.com`

## 配置方法


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



## 相关脚本

- `scripts/set-docker-mirror-env.sh` - 环境变量配置脚本
- `scripts/test-docker-mirror.sh` - 配置验证脚本