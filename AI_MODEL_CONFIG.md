# AI模型配置说明

## 当前配置

### 模型信息
- **模型名称**: `Qwen/Qwen2.5-7B-Instruct`
- **API提供商**: SiliconFlow
- **API端点**: `https://api.siliconflow.cn/v1/chat/completions`

### 模型参数
```javascript
{
  model: 'Qwen/Qwen2.5-7B-Instruct',
  temperature: 0.7,
  max_tokens: 1500,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0.5,
  stream: true
}
```

## 环境变量配置

### 开发环境 (.env)
```bash
SILICONFLOW_API_KEY=your_actual_api_key_here
SILICONFLOW_API_URL=https://api.siliconflow.cn/v1/chat/completions
SILICONFLOW_MODEL=Qwen/Qwen2.5-7B-Instruct
```

### 生产环境 (.env.production)
已配置为使用 `Qwen/Qwen2.5-7B-Instruct`

## AI诊断流程

### 1. 缓存检查
```javascript
// 首先检查缓存
const cachedResult = await getCachedDiagnosis(code);
if (cachedResult) {
  return cachedResult; // 返回缓存结果
}
```

### 2. API配置验证
```javascript
const apiKeysString = process.env.SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEYS;

if (!apiKeysString) {
  // 返回模拟响应（开发/测试用）
  return mockAnalysis;
}
```

### 3. 流式响应处理
- 使用Server-Sent Events (SSE)
- 实时流式传输AI生成的内容
- 超时设置：45秒
- 支持取消请求（AbortController）

### 4. 错误处理
- 超时错误：显示友好的日语错误消息
- API错误：记录错误状态码和响应
- 网络错误：捕获并显示错误信息

## 诊断输出格式

### 指定格式
```
ご入力いただいた {股票名称} について、モメンタム分析・リアルタイムデータ・AIロジックをもとに診断を行いました。

現在の株価は {価格} 円、前日比 {変動} 円（{変動率}）

私たちのスタッフ、「AI 株式 アシスタント」のLINEアカウントを追加してください。

追加が完了しましたら、詳細な診断レポートを受け取るために、銘柄コード「{股票名称}」または「{股票代码}」と送信してください。

メッセージを送信した瞬間にAI診断が始まり、最新レポートが即座に届きます。
```

## 验证清单

- [x] 模型名称更新为 `Qwen2.5-7B-Instruct`
- [x] .env.example 已更新
- [x] .env.production 已更新
- [x] server/routes/gemini.js 默认模型已更新
- [x] Prompt格式已更新为LINE转化格式
- [x] 缓存记录使用正确的模型名称
- [x] 流式响应正常工作
- [x] 错误处理完整
- [x] 超时机制正常

## 测试方法

### 1. 测试模拟响应（无API Key）
```bash
# 不设置API Key
npm run dev:all
# 访问页面，点击诊断按钮，应返回模拟分析
```

### 2. 测试真实API（有API Key）
```bash
# 在.env中设置真实API Key
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxx

npm run dev:all
# 访问页面，点击诊断按钮，应返回AI生成的分析
```

### 3. 验证缓存
```bash
# 第一次请求会调用API
# 第二次相同股票代码的请求会从缓存返回
# 检查响应中的 cached: true 字段
```

### 4. 验证流式响应
```bash
# 观察诊断弹窗
# 应该看到文本逐字逐句出现
# 有光标动画表示正在生成
```

## 注意事项

1. **API Key安全**
   - 不要将真实API Key提交到Git
   - 生产环境使用环境变量
   - 定期轮换API Key

2. **模型兼容性**
   - Qwen2.5-7B-Instruct 支持中文和日语
   - 响应速度比72B模型更快
   - 成本更低

3. **缓存策略**
   - 相同股票代码的诊断结果会缓存
   - 缓存时间根据数据库设置
   - 可以减少API调用次数和成本

4. **监控指标**
   - API响应时间
   - 缓存命中率
   - 错误率
   - 使用统计

## 故障排除

### 问题：诊断一直显示"接続中"
**解决方案**:
1. 检查API Key是否正确配置
2. 检查网络连接
3. 查看服务器日志中的错误信息
4. 验证SiliconFlow API服务状态

### 问题：返回格式不正确
**解决方案**:
1. 检查Prompt模板是否正确
2. 验证模型参数设置
3. 测试不同的temperature值
4. 检查max_tokens是否足够

### 问题：超时错误
**解决方案**:
1. 增加超时时间（当前45秒）
2. 检查API服务响应速度
3. 考虑使用更小的模型
4. 优化Prompt长度

## 更新历史

- **2025-10-25**: 从 Qwen2.5-VL-72B-Instruct 迁移到 Qwen2.5-7B-Instruct
- **2025-10-25**: 更新输出格式为LINE转化专用格式
- **2025-10-25**: 优化Prompt指令，强调格式遵守
