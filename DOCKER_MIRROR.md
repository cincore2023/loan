# Docker 镜像加速配置指南

## 概述

为了提高 Docker 镜像的拉取和构建速度，您可以配置 Docker 镜像加速服务。

## 配置方法

### 1. 系统级配置（推荐）

编辑或创建 `/etc/docker/daemon.json` 文件：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

然后重启 Docker 服务：

```bash
sudo systemctl restart docker
```

### 2. 环境变量配置

设置环境变量以在构建时使用镜像加速：

```bash
# 设置镜像加速地址
export DOCKER_REGISTRY_MIRROR="https://docker.mirrors.ustc.edu.cn"

# 使用镜像加速构建
DOCKER_BUILDKIT=1 docker build --registry-mirror=${DOCKER_REGISTRY_MIRROR} -t loan-app .
```

### 3. 命令行参数配置

在 docker build 命令中直接指定镜像加速地址：

```bash
# 使用 BuildKit 和镜像加速构建
DOCKER_BUILDKIT=1 docker build --registry-mirror=https://docker.mirrors.ustc.edu.cn -t loan-app .

# 传统构建模式和镜像加速
docker build --registry-mirror=https://docker.mirrors.ustc.edu.cn -t loan-app .
```

## 常用镜像加速服务

### 国内镜像加速服务

1. 中科大镜像加速: `https://docker.mirrors.ustc.edu.cn`
2. 网易镜像加速: `https://hub-mirror.c.163.com`
3. 阿里云镜像加速: `https://<your-account>.mirror.aliyuncs.com` (需要注册阿里云账号获取)

### 配置建议

1. **生产环境**：建议使用系统级配置以确保所有 Docker 操作都能受益于镜像加速
2. **开发环境**：可以使用环境变量或命令行参数进行临时配置
3. **多镜像源**：可以配置多个镜像源以提高可用性

## 验证配置

### 检查 Docker 配置

```bash
# 查看 Docker 系统信息
docker info

# 查看镜像加速配置
docker info | grep -i mirror
```

### 测试镜像拉取速度

```bash
# 测试镜像拉取
time docker pull node:18-alpine
```

通过正确配置 Docker 镜像加速，可以显著提高镜像拉取和构建速度，特别是在网络条件较差的环境中。