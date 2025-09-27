# Loan Application

## 项目介绍

Loan Application 是一个基于 Next.js 15 和 PostgreSQL 的贷款申请管理系统。

## 技术栈

- Next.js 15 (App Router)
- PostgreSQL
- Drizzle ORM
- Ant Design
- Tailwind CSS

## 快速开始

### 环境要求

- Node.js >= 18
- Docker 和 Docker Compose
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

1. 启动数据库和应用服务：

```bash
docker-compose up -d
```

2. 运行数据库迁移：

```bash
pnpm db:push
```

3. 启动开发服务器：

```bash
pnpm dev
```

### 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/loan_db

# 其他配置...
```

### 数据库操作

- 运行迁移：`pnpm db:push`
- 生成迁移文件：`pnpm db:generate`
- 查看迁移状态：`pnpm db:status`

### 开发命令

- 启动开发服务器：`pnpm dev`
- 构建生产版本：`pnpm build`
- 启动生产服务器：`pnpm start`
- 代码检查：`pnpm lint`
- 代码格式化：`pnpm format`

## 项目结构

```
.
├── app/                 # Next.js 应用目录
├── components/          # 公共组件
├── lib/                 # 工具库和业务逻辑
├── libs/database/       # 数据库相关文件
├── public/              # 静态资源
└── scripts/             # 脚本文件
```

## 数据库设计

### 管理员表 (admins)
- id: UUID 主键
- name: 管理员名称
- password: 密码（加密存储）
- is_active: 是否启用
- created_at: 创建时间
- last_login_at: 最后登录时间

### 客户表 (customers)
- id: UUID 主键
- customer_name: 客户名称
- application_amount: 申请额度
- province: 省
- city: 市
- district: 区
- phone_number: 手机号
- id_card: 身份证
- submission_time: 提交时间
- questionnaire_id: 问卷ID（外键）
- selected_questions: 用户选择的题目和答案（JSON）
- channel_link: 渠道链接
- created_at: 创建时间
- updated_at: 修改时间

### 问卷表 (questionnaires)
- id: UUID 主键
- questionnaire_number: 问卷编号（唯一）
- questionnaire_name: 问卷名称
- remark: 备注
- questions: 问卷题（JSON）
- created_at: 创建时间
- updated_at: 修改时间

### 渠道表 (channels)
- id: UUID 主键
- channel_number: 渠道编号（唯一）
- channel_name: 渠道名称
- questionnaire_id: 绑定问卷ID（外键）
- uv_count: UV访问次数
- questionnaire_submit_count: 问卷填写总数
- remark: 备注
- short_link: 短链接（唯一）
- tags: 渠道标签（JSON）
- download_link: 下载链接
- is_default: 是否为默认渠道
- created_at: 创建时间
- updated_at: 修改时间
- is_active: 是否启用

## API 接口

### 管理员接口
- POST /api/admin/login - 管理员登录
- GET /api/admin/profile - 获取管理员信息

### 客户接口
- GET /api/admin/customers - 获取客户列表
- GET /api/admin/customers/:id - 获取客户详情

### 问卷接口
- GET /api/admin/questionnaires - 获取问卷列表
- POST /api/admin/questionnaires - 创建问卷
- PUT /api/admin/questionnaires - 更新问卷
- DELETE /api/admin/questionnaires - 删除问卷

### 渠道接口
- GET /api/admin/channels - 获取渠道列表
- POST /api/admin/channels - 创建渠道
- PUT /api/admin/channels - 更新渠道
- DELETE /api/admin/channels - 删除渠道

## 部署

### Docker 部署

使用 docker-compose 一键部署：

```bash
docker-compose up -d
```

### 使用 Nginx 和 HTTPS 部署（推荐用于生产环境）

为了在生产环境中提供更好的安全性和性能，建议使用 Nginx 作为反向代理服务器，并启用 HTTPS。

#### 1. 生成 SSL 证书

首先，生成自签名 SSL 证书（在生产环境中，建议使用有效的 SSL 证书）：

```bash
# 运行脚本生成 SSL 证书
./scripts/generate-ssl.sh
```

或者手动执行：

```bash
# 创建 SSL 证书目录
mkdir -p ssl

# 生成私钥
openssl genrsa -out ssl/key.pem 2048

# 生成自签名证书
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/CN=42.121.104.68"
```

#### 2. 配置 Nginx

项目中已包含 Nginx 配置文件 [nginx.conf](nginx.conf)，该配置文件已经设置好：

- HTTP 到 HTTPS 的重定向
- SSL 配置
- 静态文件缓存
- 反向代理到 Next.js 应用
- WebSocket 支持

#### 3. 使用 Docker Compose 部署

使用包含 Nginx 的 Docker Compose 配置文件进行部署：

```bash
# 使用包含 Nginx 的配置文件启动服务
docker-compose -f docker-compose.deploy.yml up -d
```

此命令将启动三个服务：
1. PostgreSQL 数据库
2. Next.js 应用
3. Nginx 反向代理

#### 4. 访问应用

部署完成后，可以通过以下地址访问应用：

- 管理后台: https://42.121.104.68/admin
- H5 页面: https://42.121.104.68/h5

#### 5. 配置说明

Nginx 配置文件中的关键设置：

- 监听 80 端口并重定向到 HTTPS
- 监听 443 端口处理 HTTPS 请求
- 使用 Docker 网络中的服务名称 [app] 连接到 Next.js 应用
- 静态资源缓存优化
- WebSocket 连接支持

环境变量配置：

- NEXT_PUBLIC_BASE_URL 设置为 https://42.121.104.68
- NEXT_PUBLIC_API_URL 设置为 https://42.121.104.68/api

### 服务器部署（使用 pm2 运行 Next.js 应用）

如果您希望在服务器上部署时只将数据库运行在 Docker 容器中，而 Next.js 应用使用 pm2 运行，可以使用以下命令：

```
# 使用默认配置部署
pnpm server:deploy:pm2

# 使用自定义配置部署
pnpm server:deploy:pm2 --base-image node:18-alpine --port 307
```

这个命令会：
1. 检查必要工具（Docker、docker-compose、Node.js、pnpm、pm2）
2. 配置环境变量
3. 配置 Docker 镜像加速
4. 安装项目依赖
5. 启动数据库容器
6. 构建 Next.js 应用
7. 初始化数据库（运行迁移和种子数据）
8. 使用 pm2 启动应用
9. 验证部署结果

> 注意：使用此部署方式需要服务器上已安装 pm2。如果未安装，可以使用以下命令安装：
> ```bash
> npm install -g pm2
> ```

### 测试数据库初始化

如果您想测试数据库迁移和种子数据是否正常工作，可以使用以下命令：

```
# 测试数据库初始化
pnpm test:db-init
```

这个命令会：
1. 启动 PostgreSQL 数据库服务
2. 运行数据库迁移脚本创建表结构
3. 运行种子数据脚本插入初始数据
4. 验证数据是否正确创建

### 直接运行 Docker 镜像

如果您已经构建了 Docker 镜像并希望直接运行它，可以使用以下命令：

```
# 使用默认配置运行镜像
pnpm run:app

# 使用自定义配置运行镜像
pnpm run:app --port 307 --tag v1.0.0

# 同时启动数据库服务
pnpm run:app --with-db --port 307

# 启动数据库服务并运行数据库迁移
pnpm run:app --with-db --migrate --port 307
```

这个命令会：
1. 检查指定标签的镜像是否存在
2. 创建默认的环境变量文件（如果不存在）
3. 运行容器并映射指定端口
4. 等待应用启动并验证运行状态

如果您使用 `--with-db` 参数，脚本还会启动 PostgreSQL 数据库服务。

如果您使用 `--migrate` 参数，脚本会在应用启动后运行数据库迁移和种子数据脚本。

> 注意：使用 `--migrate` 参数需要同时使用 `--with-db` 参数，因为数据库迁移需要数据库服务运行。

### 本地构建并部署到服务器

为了提高部署效率，您可以选择在本地构建应用，然后将构建好的镜像部署到服务器：

```
# 使用默认配置进行本地构建并部署
pnpm local:deploy <服务器地址> <服务器用户名>

# 使用自定义配置进行本地构建并部署
pnpm local:deploy --base-image node:18-alpine --tag v1.0.0 <服务器地址> <服务器用户名>
```

> 注意：我们已经添加了必要的 Dockerfile 文件来支持本地构建。如果您之前遇到 "no such file or directory" 错误，请确保您使用的是最新版本的代码。

> 如果在部署过程中遇到 Docker 镜像拉取超时问题（如 "net/http: request canceled while waiting for connection"），这是因为脚本会自动将本地构建的镜像上传到服务器，避免从 Docker Hub 拉取镜像。

这种方式会在本地完成所有构建工作，然后将构建好的镜像和配置文件上传到服务器，避免在服务器上消耗资源进行构建。

### 手动部署

1. 安装依赖：

```bash
pnpm install
```

2. 构建应用：

```bash
pnpm build
```

3. 启动应用：

```bash
pnpm start
```

## 开发指南

### 添加新功能

1. 在 `app/` 目录下创建新页面
2. 在 `components/` 目录下创建相关组件
3. 如需数据库操作，在 `libs/database/schema.ts` 中添加新表结构
4. 运行 `pnpm db:generate` 生成迁移文件
5. 运行 `pnpm db:push` 应用迁移

### 代码规范

- 使用 TypeScript
- 遵循 Next.js App Router 规范
- 使用 ESLint 和 Prettier 保持代码风格一致

## 常见问题

### 数据库连接失败

确保 Docker 容器正常运行：

```bash
docker-compose ps
```

检查数据库连接配置是否正确，端口是否被占用。

### 数据库迁移失败

检查数据库是否正常启动，以及连接字符串是否正确。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。