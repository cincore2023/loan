# 自定义基础镜像使用指南

## 目录

1. [概述](#概述)
2. [使用方法](#使用方法)
3. [配置自定义基础镜像](#配置自定义基础镜像)
4. [最佳实践](#最佳实践)

## 概述

本文档介绍了如何在构建Docker镜像时使用自定义的基础镜像，以提高构建速度和满足特定需求。

## 使用方法

### 通过构建参数指定基础镜像

Dockerfile中已添加了BASE_IMAGE构建参数，允许在构建时指定基础镜像：

```dockerfile
# 允许通过构建参数指定基础镜像
ARG BASE_IMAGE=node:18-alpine
FROM ${BASE_IMAGE}
```

### 在部署脚本中指定基础镜像

```bash
# 使用npm脚本
npm run server:deploy -- --base-image registry.cn-hangzhou.aliyuncs.com/your-namespace/node:18-alpine

# 或者直接运行脚本
./scripts/server-deploy.sh --base-image registry.cn-hangzhou.aliyuncs.com/your-namespace/node:18-alpine
```

## 配置自定义基础镜像

### 1. 使用官方Node.js镜像（推荐配合镜像加速使用）

```bash
# 使用官方Node.js镜像（默认，通过镜像加速拉取）
./scripts/server-deploy.sh

# 或者显式指定
./scripts/server-deploy.sh --base-image node:18-alpine
```

### 2. 使用阿里云镜像

如果您更喜欢使用阿里云的Node.js镜像：

```bash
# 使用阿里云Node.js镜像
./scripts/server-deploy.sh --base-image registry.cn-hangzhou.aliyuncs.com/aliyun-node/node:18-alpine
```

### 3. 使用您自己的私有镜像

如果您有自己的私有镜像仓库：

```bash
./scripts/server-deploy.sh --base-image registry.your-company.com/node:18-alpine
```

### 4. 使用本地缓存的镜像

如果您已经拉取了基础镜像到本地：

```bash
./scripts/server-deploy.sh --base-image node:18-alpine
```

## 最佳实践

### 1. 镜像选择

1. 选择与您应用兼容的基础镜像版本
2. 优先使用经过验证的镜像（如阿里云提供的镜像）
3. 考虑镜像大小和安全更新频率

### 2. 镜像缓存

1. 在服务器上预先拉取基础镜像以加快构建速度
2. 定期更新基础镜像以获取安全补丁

```bash
# 预先拉取阿里云Node.js镜像
docker pull registry.cn-hangzhou.aliyuncs.com/aliyun-node/node:18-alpine
```

### 3. 镜像验证

1. 验证基础镜像的完整性和来源
2. 在生产环境中使用经过测试的基础镜像

### 4. 备用方案

1. 准备多个基础镜像选项以防某个镜像不可用
2. 在脚本中添加基础镜像可用性检查

## 镜像加速

本项目已配置使用镜像加速地址 `https://docker.xuanyuan.me` 来加速基础镜像的拉取过程。

在构建过程中，无论是使用 BuildKit 还是传统 Docker 构建方式，都会通过以下方式应用镜像加速：

1. **BuildKit 构建方式**：
   ```bash
   DOCKER_BUILDKIT=1 docker build --registry-mirror=https://docker.xuanyuan.me ...
   ```

2. **传统构建方式**：
   ```bash
   docker build --registry-mirror=https://docker.xuanyuan.me ...
   ```

这样可以确保无论使用哪种构建方式，都能享受到镜像加速带来的更快拉取速度。