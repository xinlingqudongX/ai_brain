# CORS 跨域配置说明

## 概述

为了支持前端应用与后端API的跨域通信，项目已配置了完善的CORS（跨源资源共享）支持。

## 配置文件

### 主配置文件
- `src/config/cors.config.ts` - CORS配置逻辑
- `src/main.ts` - 应用启动时注册CORS插件

### 环境配置
- `.env` - 环境变量配置
- `.env.example` - 环境变量示例

## 开发环境配置

开发环境下，CORS配置允许以下源访问：

```typescript
origin: [
  'http://localhost:5173', // Vite 开发服务器
  'http://localhost:3000', // 本地开发
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:4173', // Vite 预览服务器
  'http://localhost:8080', // 其他可能的开发端口
]
```

### 支持的HTTP方法
- GET
- POST
- PUT
- DELETE
- OPTIONS
- PATCH

### 允许的请求头
- Content-Type
- Authorization
- Accept
- Origin
- X-Requested-With
- Access-Control-Allow-Origin

## 生产环境配置

生产环境使用白名单机制，只允许预定义的域名访问：

### 默认允许的域名
```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://app.yourdomain.com',
];
```

### 通过环境变量配置
可以通过 `ALLOWED_ORIGINS` 环境变量添加更多允许的域名：

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

## 安全特性

### 1. 环境区分
- 开发环境：宽松的CORS策略，便于开发调试
- 生产环境：严格的白名单机制，确保安全性

### 2. 源验证
生产环境下会验证请求来源：
```typescript
if (!origin || allowedOrigins.includes(origin)) {
  callback(null, true);
} else {
  console.warn(`CORS blocked origin: ${origin}`);
  callback(new Error('Not allowed by CORS'));
}
```

### 3. 凭据支持
配置了 `credentials: true`，支持携带Cookie和认证信息的跨域请求。

### 4. 预检请求支持
配置了 `optionsSuccessStatus: 200`，确保预检请求正常处理。

## 使用说明

### 前端配置
前端应用无需特殊配置，正常发起HTTP请求即可：

```typescript
// 示例：发送POST请求
const response = await axios.post('http://localhost:3000/api/v1/llm/action/send-message', {
  sessionId: 'xxx',
  message: 'Hello'
});
```

### 开发环境启动
```bash
# 启动后端（默认端口3000）
npm run start:dev

# 启动前端（默认端口5173）
cd frontend
npm run dev
```

### 生产环境部署
1. 设置环境变量：
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

2. 启动应用：
```bash
npm run start:prod
```

## 故障排除

### 常见CORS错误

#### 1. "Access to fetch at ... has been blocked by CORS policy"
**原因**：请求的源不在允许列表中
**解决**：
- 开发环境：检查前端端口是否在允许列表中
- 生产环境：将域名添加到 `ALLOWED_ORIGINS` 环境变量

#### 2. "CORS policy: Request header ... is not allowed"
**原因**：请求头不在允许列表中
**解决**：在 `cors.config.ts` 的 `allowedHeaders` 中添加需要的请求头

#### 3. "CORS policy: Method ... is not allowed"
**原因**：HTTP方法不在允许列表中
**解决**：在 `cors.config.ts` 的 `methods` 中添加需要的HTTP方法

### 调试技巧

#### 1. 查看CORS日志
生产环境下，被阻止的请求会在控制台输出警告：
```
CORS blocked origin: https://unauthorized-domain.com
```

#### 2. 检查预检请求
使用浏览器开发者工具查看OPTIONS请求是否正常：
- Network标签页
- 查找OPTIONS方法的请求
- 检查响应头中的CORS相关字段

#### 3. 验证环境变量
```bash
# 检查当前环境
echo $NODE_ENV

# 检查允许的源
echo $ALLOWED_ORIGINS
```

## 最佳实践

### 1. 开发环境
- 使用具体的端口号，避免使用通配符
- 包含常用的开发端口（5173, 3000, 8080等）

### 2. 生产环境
- 只允许必要的域名
- 定期审查和更新域名白名单
- 使用HTTPS协议

### 3. 安全建议
- 不要在生产环境使用通配符（*）
- 定期检查CORS日志，发现异常访问
- 结合其他安全措施（如API密钥、JWT等）

## 配置示例

### 开发环境 (.env)
```bash
NODE_ENV=development
PORT=3000
```

### 生产环境 (.env)
```bash
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://chat.yourdomain.com,https://app.yourdomain.com
```

### 自定义配置
如需自定义CORS配置，可以修改 `src/config/cors.config.ts` 文件：

```typescript
export const getCorsConfig = (): CorsConfig => {
  // 自定义逻辑
  return {
    origin: ['https://your-custom-domain.com'],
    methods: ['GET', 'POST'],
    // ... 其他配置
  };
};
```

通过以上配置，项目已具备完善的跨域支持，可以安全地在不同环境下运行。