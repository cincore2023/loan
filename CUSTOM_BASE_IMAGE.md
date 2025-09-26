# 自定义基础镜像配置指南

## 概述

本项目支持通过构建参数自定义 Docker 基础镜像，以满足不同环境的部署需求。默认使用官方 `node:18-alpine` 镜像。

## 使用方法

### 1. 使用默认基础镜像

```bash
# 使用默认基础镜像构建
docker build -t loan-app .
```

### 2. 指定自定义基础镜像

```bash
# 指定自定义基础镜像构建
docker build -t loan-app --build-arg BASE_IMAGE=node:18-alpine .
```

### 3. 服务器部署时指定基础镜像

```bash
# 服务器部署时指定基础镜像
./scripts/server-deploy.sh --base-image node:18-alpine
```

## 配置说明

### Dockerfile 中的基础镜像配置

``dockerfile
# 使用 ARG 指令定义基础镜像参数
ARG BASE_IMAGE=node:18-alpine
FROM ${BASE_IMAGE}
```

### 服务器部署脚本中的基础镜像配置

服务器部署脚本 `server-deploy.sh` 支持通过 `--base-image` 参数指定基础镜像：

```bash
# 使用自定义基础镜像部署
./scripts/server-deploy.sh --base-image node:18-alpine
```

## 镜像选择建议

### 官方镜像

- `node:18-alpine` - 官方 Node.js 18 Alpine 镜像，体积小，适合生产环境
- `node:18` - 官方 Node.js 18 镜像，基于 Debian，功能完整

### 选择考虑因素

1. **安全性**：优先选择官方维护的镜像
2. **体积**：Alpine 版本体积更小，构建和部署更快
3. **兼容性**：确保基础镜像与应用依赖兼容
4. **维护性**：选择长期支持版本

## 最佳实践

1. **生产环境**：推荐使用 `node:18-alpine` 以减小镜像体积
2. **开发环境**：可使用 `node:18` 以获得更好的调试支持
3. **版本锁定**：在生产环境中应锁定具体版本，避免自动升级导致的问题
4. **定期更新**：定期更新基础镜像以获取安全补丁

通过以上配置，您可以灵活地根据部署环境选择合适的基础镜像，同时保持项目的可维护性和安全性。

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