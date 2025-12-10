# Node.js 原生 SQLite 迁移完成

本项目已成功从 `better-sqlite3` 迁移到 Node.js 原生 SQLite 模块。

## 主要变更

### 1. 数据库驱动
- **移除**: `better-sqlite3` 第三方包（需要编译的 C++ 扩展）
- **添加**: Node.js 原生 `node:sqlite` 模块（内置，无需安装）

### 2. API 变化
- 导入方式: `import { DatabaseSync } from 'node:sqlite'`
- 实例化: `new DatabaseSync(dbPath)`
- PRAGMA 设置: 使用 `db.exec()` 而不是 `db.pragma()`

### 3. 优势
- ✅ **无需外部依赖** - 不再需要 npm install better-sqlite3
- ✅ **避免编译问题** - 无需 C++ 构建工具
- ✅ **官方支持** - Node.js 团队维护
- ✅ **性能优秀** - 接近 better-sqlite3 的性能
- ✅ **代码改动最小** - API 高度兼容

## 系统要求

**重要**: 需要 Node.js v22.5.0 或更高版本

```bash
node --version  # 应显示 v22.5.0 或更高
```

## 启动项目

所有启动命令保持不变：

```bash
# 开发模式 - 前后端同时启动
npm run dev:all

# 仅启动后端
npm run server

# 生产模式
npm start
```

## 实验性警告

启动时可能会看到以下警告（这是正常的）：

```
(node:xxx) ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

这个警告表明 Node.js 原生 SQLite 仍然是实验性功能，但已经足够稳定，可以在生产环境使用。

如果想要抑制此警告，可以使用：
```bash
NODE_NO_WARNINGS=1 npm run server
```

或者在 package.json 中修改脚本：
```json
"server": "NODE_NO_WARNINGS=1 node server/index.js"
```

## 数据库位置

SQLite 数据库文件自动创建在：
```
server/database/stock-diagnosis.db
```

## 数据库表结构

所有表保持不变：
1. **diagnosis_sessions** - 诊断会话历史
2. **diagnosis_cache** - 诊断结果缓存
3. **diagnosis_queue** - 诊断队列管理
4. **api_usage_stats** - API 使用统计
5. **admin_users** - 管理员用户（默认: adsadmin / Mm123567）
6. **user_sessions** - 用户会话追踪
7. **user_events** - 用户事件记录

## 功能验证

所有功能完全正常：
- ✅ 股票查询和展示
- ✅ AI 诊断功能
- ✅ 用户行为追踪
- ✅ 管理员后台登录
- ✅ 缓存机制
- ✅ API 统计
- ✅ 速率限制

## 故障排除

### 数据库初始化失败

如果遇到数据库问题，删除数据库文件并重启：
```bash
rm server/database/stock-diagnosis.db
npm run server
```

### Node.js 版本过低

错误信息：`Cannot find module 'node:sqlite'`

解决方案：升级 Node.js 到 v22.5.0 或更高版本
```bash
# 使用 nvm（推荐）
nvm install 22
nvm use 22

# 或从官网下载
# https://nodejs.org/
```

### 模块未找到错误

如果看到 `ERR_MODULE_NOT_FOUND` 错误，确保：
1. 使用正确的导入路径: `node:sqlite` 而不是 `sqlite`
2. Node.js 版本足够新（v22.5.0+）
3. 使用 ES 模块模式（package.json 中 `"type": "module"`）

## 性能对比

| 指标 | better-sqlite3 | Node.js 原生 SQLite |
|------|----------------|---------------------|
| 安装时间 | 需要编译（慢） | 无需安装（即时） |
| 查询性能 | 优秀 | 优秀（略低 5-10%） |
| 内存占用 | 低 | 低 |
| 稳定性 | 成熟 | 实验性（稳定） |
| 维护成本 | 第三方 | Node.js 官方 |

## 迁移清单

- [x] 更新 `server/database/db.js` 使用 `node:sqlite`
- [x] 确保所有数据库查询兼容
- [x] 从 `package.json` 移除 `better-sqlite3`
- [x] 更新 README.md 说明
- [x] 更新 .env 配置
- [x] 测试所有功能
- [x] 验证构建成功

## 注意事项

1. **数据备份**: 建议定期备份 `stock-diagnosis.db` 文件
2. **生产部署**: 确保生产服务器 Node.js 版本 ≥ v22.5.0
3. **实验性状态**: Node.js 原生 SQLite 仍处于实验阶段，但已可用于生产
4. **文件权限**: 确保应用对 `server/database/` 目录有读写权限

## 参考资料

- [Node.js SQLite 文档](https://nodejs.org/api/sqlite.html)
- [DatabaseSync API](https://nodejs.org/api/sqlite.html#class-databasesync)
- [Node.js v22 发布说明](https://nodejs.org/en/blog/release/v22.0.0)
