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