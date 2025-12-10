# 迁移完成：从 Supabase 到本地 SQLite

本项目已成功从云端 Supabase 数据库迁移到本地 SQLite 数据库。

## 主要变更

### 1. 数据库层面
- **移除**: Supabase PostgreSQL 数据库
- **添加**: 本地 SQLite 数据库 (`server/database/stock-diagnosis.db`)
- **保留**: 所有原有表结构和功能

### 2. 认证系统
- **移除**: Supabase Auth
- **添加**: 基于 JWT 的本地认证系统
- **管理员账户**:
  - 用户名: `adsadmin`
  - 密码: `Mm123567`

### 3. API 端点

新增以下 API 端点：

#### 管理员认证
- `POST /api/admin/login` - 管理员登录
- `POST /api/admin/logout` - 管理员登出
- `GET /api/admin/verify` - 验证登录状态
- `GET /api/admin/sessions` - 获取用户会话数据
- `GET /api/admin/stats` - 获取统计数据

#### 用户追踪
- `POST /api/tracking/session` - 记录用户会话
- `POST /api/tracking/event` - 记录用户事件

#### 现有端点（保持不变）
- `GET /api/stock/*` - 股票数据
- `POST /api/gemini/diagnosis` - AI 诊断
- `GET /api/gemini/stats` - API 统计

## 数据库表结构

SQLite 数据库包含以下表：

1. **diagnosis_sessions** - 诊断会话
2. **diagnosis_cache** - 诊断结果缓存
3. **diagnosis_queue** - 诊断队列
4. **api_usage_stats** - API 使用统计
5. **admin_users** - 管理员用户
6. **user_sessions** - 用户会话
7. **user_events** - 用户事件

## 环境变量更新

### 移除的变量
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 新增的变量
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 保留的变量
```
VITE_API_URL=http://localhost:3001
GEMINI_API_KEY=your_api_key
API_PORT=3001
NODE_ENV=development
```

## 安装依赖

新增了以下 npm 包：
- `better-sqlite3` - SQLite 数据库驱动
- `jsonwebtoken` - JWT 认证
- `bcrypt` - 密码哈希

移除了：
- `@supabase/supabase-js`

## 启动项目

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 到 `.env` 并配置：
```bash
cp .env.example .env
```

### 3. 启动开发服务器
```bash
# 启动后端服务器（会自动初始化数据库）
npm run server

# 在另一个终端启动前端
npm run dev

# 或者同时启动
npm run dev:all
```

### 4. 生产环境部署
```bash
npm run build
npm run start
```

## 数据库位置

SQLite 数据库文件位于：
```
server/database/stock-diagnosis.db
```

## 优势

1. **完全本地化** - 无需依赖外部云服务
2. **简化部署** - 数据库文件随项目一起部署
3. **更快响应** - 消除网络延迟
4. **数据控制** - 完全掌控数据和隐私
5. **零成本** - 不需要 Supabase 账户和费用

## 注意事项

1. **数据备份**: 建议定期备份 `stock-diagnosis.db` 文件
2. **JWT 密钥**: 生产环境务必更改 `JWT_SECRET` 为随机字符串
3. **管理员密码**: 首次登录后建议修改默认管理员密码
4. **文件权限**: 确保应用对 `server/database/` 目录有读写权限

## 功能验证

所有原有功能保持不变：
- ✅ 股票查询和展示
- ✅ AI 诊断功能
- ✅ 用户行为追踪
- ✅ 管理员后台
- ✅ 缓存机制
- ✅ API 限流

## 故障排除

### 数据库初始化失败
如果数据库初始化失败，删除 `stock-diagnosis.db` 文件并重启服务器：
```bash
rm server/database/stock-diagnosis.db
npm run server
```

### 管理员登录失败
确保已正确初始化管理员账户。检查服务器日志查看 "Initial admin user created" 消息。

### API 连接错误
确保 `VITE_API_URL` 在 `.env` 中正确配置为后端服务器地址。
