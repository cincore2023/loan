# Loan Application

这是一个基于 Next.js 的全栈应用程序，包含 H5、Admin 和 API 模块。

## 项目结构

```
.
├── app/                    # Next.js 应用目录
│   ├── h5/               # H5 应用模块
│   │   ├── app/          # H5 页面组件
│   │   ├── components/   # H5 组件
│   │   └── ...
│   ├── admin/            # Admin 管理后台模块
│   │   ├── app/          # Admin 页面组件
│   │   ├── components/   # Admin 组件
│   │   └── ...
│   ├── api/              # API 路由模块
│   │   ├── routes/       # API 路由
│   │   ├── controllers/  # 控制器
│   │   └── ...
│   └── ...
├── libs/                 # 共享库
│   └── database/         # 数据库相关
├── components/           # 共享组件
├── public/               # 静态资源
└── ...
```

## 技术栈

- **框架**: Next.js 15
- **数据库**: PostgreSQL + Drizzle ORM
- **样式**: Tailwind CSS
- **UI 组件库**: Ant Design Pro
- **图标库**: @ant-design/icons
- **通知**: Sonner
- **数据验证**: Zod
- **ID 生成**: UUID
- **部署**: Docker + Docker Compose

## 数据库表结构

### 用户表 (users)
- id: UUID 主键
- name: 用户名
- email: 邮箱（唯一）
- created_at: 创建时间

### 管理员表 (admins)
- id: UUID 主键
- name: 管理员名
- password: 密码
- is_active: 是否激活
- created_at: 创建时间
- last_login_at: 最后登录时间

### 客户表 (customers)
- id: UUID 主键
- customer_number: 客户编号（唯一）
- customer_name: 客户名称
- application_amount: 申请额度
- province: 省
- city: 市
- district: 区
- phone_number: 手机号
- id_card: 身份证
- submission_time: 提交时间
- questionnaire_id: 关联的问卷 ID
- channel_link: 渠道链接
- created_at: 创建时间
- updated_at: 修改时间

### 问卷表 (questionnaires)
- id: UUID 主键
- questionnaire_number: 问卷编号（唯一）
- questionnaire_name: 问卷名称
- remark: 备注
- questions: 问卷题目（JSON 格式存储）
- created_at: 创建时间
- updated_at: 修改时间

### 渠道管理表 (channels)
- id: UUID 主键
- channel_number: 渠道编号（唯一）
- channel_name: 渠道名称
- questionnaire_id: 绑定的问卷 ID
- uv_count: UV 访问次数
- questionnaire_submit_count: 问卷填写总数
- remark: 备注
- short_link: 渠道短连接（唯一）
- created_at: 创建时间
- updated_at: 修改时间
- is_active: 是否启用

## 开发环境搭建

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 访问应用:
   - H5 应用: http://localhost:3000/h5
   - Admin 应用: http://localhost:3000/admin
   - API 接口: http://localhost:3000/api

## 数据库操作

- 生成迁移文件:
  ```bash
  npm run db:generate
  ```

- 执行迁移:
  ```bash
  npm run db:migrate
  ```

- 启动数据库管理工具:
  ```bash
  npm run db:studio
  ```

- 添加默认管理员用户:
  ```bash
  npm run db:seed
  ```

## Admin 管理后台

Admin 管理后台包含登录页面和各个功能模块页面：

- **登录页面**: http://localhost:3000/admin
  - 使用 Ant Design Pro 组件构建
  - 使用 @ant-design/icons 图标

- **客户资料页面**: http://localhost:3000/admin/customers
  - 包含客户信息的增删改查功能
  - 支持搜索、筛选和分页

- **问卷设置页面**: http://localhost:3000/admin/questionnaires
  - 包含问卷信息的增删改查功能
  - 支持搜索、筛选和分页

- **渠道管理页面**: http://localhost:3000/admin/channels
  - 包含渠道信息的增删改查功能
  - 支持搜索、筛选和分页

## Docker 部署

使用 Docker Compose 启动应用和数据库:

```bash
docker-compose up -d
```

## 环境变量

创建 `.env` 文件并配置以下变量:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loan_db
```

## 更新日志

### 2025-09-21
- 移除了未使用的 Radix UI 组件，统一使用 Ant Design Pro 作为后台管理界面的 UI 组件库
- 更新了登录页面，使用 Ant Design Pro 组件重构
- 优化了客户资料页面的地域筛选功能，使用级联选择器替代原来的三个独立下拉框
- 删除了重复的侧边栏组件，只保留 AntdSidebar 组件
- 更新了 README 文档，反映了最新的技术栈和组件库使用情况