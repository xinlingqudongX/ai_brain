# CORS 跨域配置完成总结

## 配置概述

已为AI聊天系统后端添加了完善的CORS（跨源资源共享）配置，支持前端应用与后端API的跨域通信。

## 完成的工作

### 1. 添加CORS依赖

**文件**: `package.json`
- 添加了 `@fastify/cors` 依赖包
- 版本: `^10.0.1`

### 2. 创建CORS配置模块

**文件**: `src/config/cors.config.ts`
- 创建了独立的CORS配置模块
- 支持开发环境和生产环境的不同配置策略
- 提供了类型安全的配置接口

**主要功能**:
- 开发环境：允许常用的本地开发端口
- 生产环境：基于白名单的严格域名验证
- 支持环境变量配置允许的域名

### 3. 更新应用启动配置

**文件**: `src/main.ts`
- 集成CORS配置到Fastify应用
- 更新Swagger文档标题和标签
- 添加聊天管理相关的API文档标签

**配置特性**:
- 支持多种HTTP方法（GET, POST, PUT, DELETE, OPTIONS, PATCH）
- 配置了必要的请求头白名单
- 启用了凭据支持（credentials: true）
- 设置了预检请求成功状态码

### 4. 环境变量配置

**文件**: `.env.example`
- 添加了 `NODE_ENV` 环境变量
- 添加了 `ALLOWED_ORIGINS` 生产环境配置示例
- 提供了完整的环境变量配置模板

### 5. 创建测试脚本

**文件**: `scripts/test-cors.js`
- 创建了CORS配置验证脚本
- 支持预检请求和实际请求的测试
- 提供详细的测试结果和CORS响应头信息

**使用方法**:
```bash
npm run test:cors
```

### 6. 完善文档

**文件**: `docs/CORS配置说明.md`
- 详细的CORS配置说明文档
- 包含开发和生产环境的配置指南
- 提供故障排除和最佳实践建议

## 配置详情

### 开发环境CORS设置

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

### 生产环境CORS设置

```typescript
// 基于白名单的域名验证
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://app.yourdomain.com',
  // 支持环境变量扩展
  ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
];
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

## 安全特性

### 1. 环境区分
- **开发环境**: 宽松策略，便于开发调试
- **生产环境**: 严格白名单，确保安全性

### 2. 域名验证
- 生产环境下严格验证请求来源
- 记录被阻止的请求日志
- 支持通过环境变量动态配置允许的域名

### 3. 凭据支持
- 配置 `credentials: true`
- 支持携带Cookie和认证信息的跨域请求

### 4. 预检请求处理
- 正确处理OPTIONS预检请求
- 设置 `optionsSuccessStatus: 200`

## 使用指南

### 开发环境启动

```bash
# 1. 启动后端服务
npm run start:dev

# 2. 启动前端服务
cd frontend
npm run dev

# 3. 测试CORS配置
npm run test:cors
```

### 生产环境部署

```bash
# 1. 设置环境变量
export NODE_ENV=production
export ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# 2. 启动生产服务
npm run start:prod
```

### 前端API调用示例

```typescript
// 前端代码示例
const response = await axios.post('http://localhost:3000/api/v1/llm/action/send-message', {
  sessionId: 'session-id',
  message: 'Hello AI'
}, {
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 如果需要发送凭据
});
```

## 验证方法

### 1. 使用测试脚本
```bash
npm run test:cors
```

### 2. 浏览器开发者工具
- 打开Network标签页
- 查看OPTIONS预检请求
- 检查响应头中的CORS字段

### 3. 手动测试
```bash
# 测试预检请求
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3000/api/v1/llm/action/get-models
```

## 故障排除

### 常见问题

1. **"blocked by CORS policy"错误**
   - 检查请求源是否在允许列表中
   - 验证环境变量配置

2. **预检请求失败**
   - 检查OPTIONS方法是否被正确处理
   - 验证请求头是否在允许列表中

3. **生产环境访问被拒绝**
   - 检查 `ALLOWED_ORIGINS` 环境变量
   - 确认域名格式正确（包含协议）

### 调试技巧

1. 查看服务器日志中的CORS警告
2. 使用浏览器开发者工具检查网络请求
3. 运行CORS测试脚本验证配置

## 总结

CORS配置已完成，具备以下特性：

✅ **完整的跨域支持** - 支持所有必要的HTTP方法和请求头
✅ **环境区分配置** - 开发和生产环境使用不同的安全策略  
✅ **灵活的域名管理** - 支持环境变量动态配置允许的域名
✅ **安全性保障** - 生产环境使用严格的白名单机制
✅ **完善的测试工具** - 提供自动化测试脚本验证配置
✅ **详细的文档** - 包含使用指南和故障排除说明

现在前端应用可以正常与后端API进行跨域通信，支持完整的聊天功能。