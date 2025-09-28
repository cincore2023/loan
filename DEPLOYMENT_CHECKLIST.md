# 服务器部署清单

## 部署前检查

### 1. 环境配置检查
- [ ] 确认 [.env.production](file:///Users/sado/code/cincore/loan/.env.production) 文件中的配置正确
  - [ ] 数据库配置（DB_USER, DB_PASSWORD, DB_NAME）
  - [ ] JWT_SECRET 已更改为安全的随机字符串
  - [ ] NEXT_PUBLIC_BASE_URL 和 NEXT_PUBLIC_API_URL 设置为正确的服务器IP或域名
- [ ] 确认 [nginx.conf](file:///Users/sado/code/cincore/loan/nginx.conf) 中的 server_name 设置为正确的服务器IP或域名
- [ ] 确认 SSL 证书已放置在 [ssl](file:///Users/sado/code/cincore/loan/ssl) 目录中
  - [ ] cert.pem
  - [ ] key.pem

### 2. 代码检查
- [ ] 确认所有功能测试通过
- [ ] 确认没有遗留的测试文件或调试代码
- [ ] 确认认证机制正常工作
- [ ] 确认数据库连接正常

### 3. 部署脚本检查
- [ ] 确认 [scripts/server-deploy.sh](file:///Users/sado/code/cincore/loan/scripts/server-deploy.sh) 脚本具有执行权限
- [ ] 确认 [scripts/init-database.sh](file:///Users/sado/code/cincore/loan/scripts/init-database.sh) 脚本具有执行权限
- [ ] 确认 [scripts/db-backup.sh](file:///Users/sado/code/cincore/loan/scripts/db-backup.sh) 脚本具有执行权限

## 部署步骤

### 1. 构建和部署应用
```bash
# 给脚本添加执行权限
chmod +x scripts/*.sh

# 执行部署脚本
./scripts/server-deploy.sh
```

### 2. 初始化数据库
```bash
# 等待服务启动完成后执行数据库初始化
./scripts/init-database.sh
```

### 3. 验证部署
- [ ] 访问 https://your-server-ip 检查应用是否正常运行
- [ ] 测试登录功能
- [ ] 测试API接口
- [ ] 检查数据库数据是否正确

## 部署后操作

### 1. 安全配置
- [ ] 更改默认管理员密码
- [ ] 配置防火墙规则
- [ ] 设置定期备份计划

### 2. 监控和日志
- [ ] 配置日志收集
- [ ] 设置健康检查
- [ ] 配置监控告警

## 常见问题处理

### 1. 服务无法启动
- 检查 Docker 容器日志: `docker-compose -f docker-compose.deploy.yml logs`
- 检查端口占用情况: `netstat -tlnp`

### 2. 数据库连接失败
- 检查数据库容器是否正常运行: `docker-compose -f docker-compose.deploy.yml ps`
- 检查数据库连接配置是否正确

### 3. SSL证书问题
- 检查证书文件是否存在且权限正确
- 检查 nginx.conf 中证书路径配置是否正确

## 备份和恢复

### 1. 数据库备份
```bash
./scripts/db-backup.sh backup
```

### 2. 数据库恢复
```bash
./scripts/db-backup.sh restore backup_filename.sql
```