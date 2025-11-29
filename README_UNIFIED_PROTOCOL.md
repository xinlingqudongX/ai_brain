# 多平台AI客户端统一协议适配器

基于 `fetch-event-stream` 库实现的多平台AI客户端统一交互系统。

## 🚀 功能特性

- ✅ **统一协议适配器**: 支持SSE、Mock等多种协议
- ✅ **fetch-event-stream集成**: 使用现代fetch API处理SSE流
- ✅ **多平台支持**: 通义千问、百度、DeepSeek、ChatGLM、Tongyi
- ✅ **Mock适配器**: 支持开发和测试模式
- ✅ **向后兼容**: 保持现有API接口不变
- ✅ **流式响应**: 支持实时流式数据交互
- ✅ **错误处理**: 完善的错误处理机制

## 📦 安装依赖

```bash
npm install fetch-event-stream
```

## 🔧 快速开始

### 基本使用

```typescript
import { QwenClient } from './src/clients/qwen_client';

// 创建客户端（使用Mock模式）
const client = new QwenClient({
    cookies: 'your_cookies_here',
    useMock: true // 使用模拟数据
});

// 发送流式消息
const response = await client.sendMessage('你好，请介绍一下自己');

for await (const chunk of response) {
    process.stdout.write(chunk); // 实时输出流式响应
}
```

### 切换协议适配器

```typescript
import { ProtocolType } from './src/api/protocol/protocol_types';

// 切换到SSE适配器（实际使用时）
client.setProtocolType(ProtocolType.SSE);

// 切换到Mock适配器（测试时使用）
client.setProtocolType(ProtocolType.MOCK);
```

## 🏗️ 架构设计

### 协议适配器层

```
┌─────────────────────────────────────┐
│        ProtocolAdapterManager       │
├─────────────────────────────────────┤
│  ┌─────────────┬─────────────────┐ │
│  │ SSEAdapter  │   MockAdapter   │ │
│  └─────────────┴─────────────────┘ │
└─────────────────────────────────────┘
```

### 客户端层

```
┌─────────────────────────────────────┐
│         AI Clients                  │
├─────────────────────────────────────┤
│  QwenClient  │  BaiduClient       │ │
│  DeepSeekClient │ ChatGLMClient   │ │
│  TongyiClient                      │ │
└─────────────────────────────────────┘
```

## 📋 支持的AI平台

| 平台 | 客户端类 | 认证方式 |
|------|----------|----------|
| 通义千问 | `QwenClient` | Cookies |
| 百度 | `BaiduClient` | Cookies |
| DeepSeek | `DeepSeekClient` | Authorization |
| ChatGLM | `ChatGLMClient` | Authorization + Device ID |
| Tongyi | `TongyiClient` | XSRF Token |

## 🔍 核心组件

### 1. 协议适配器管理器 (`ProtocolAdapterManager`)

统一管理不同类型的协议适配器，提供统一的接口。

### 2. SSE适配器 (`SSEAdapter`)

基于 `fetch-event-stream` 库实现，处理SSE流式响应。

### 3. Mock适配器 (`MockAdapter`)

提供模拟数据，支持开发和测试。

### 4. 统一协议类型 (`ProtocolType`)

定义支持的协议类型枚举。

## 🎯 使用示例

### 流式对话

```typescript
import { QwenClient } from './src/clients/qwen_client';

async function streamingChat() {
    const client = new QwenClient({
        cookies: 'your_cookies',
        useMock: true
    });

    const message = '请介绍一下机器学习';
    const response = await client.sendMessage(message);

    console.log('AI回复:');
    for await (const chunk of response) {
        process.stdout.write(chunk);
    }
}
```

### 获取用户信息

```typescript
const userInfo = await client.getUserInfo();
console.log('用户信息:', userInfo);
```

### 协议适配器切换

```typescript
// 获取当前适配器信息
const adapter = client.getProtocolAdapter();
console.log('当前协议:', adapter.getProtocolType());

// 切换适配器类型
client.setProtocolType(ProtocolType.SSE);
```

## 🧪 开发模式

### 使用Mock数据

```typescript
const client = new QwenClient({
    cookies: 'test_cookies',
    useMock: true // 启用Mock模式
});
```

### 自定义Mock数据

```typescript
import { MockAdapter } from './src/api/protocol/mock_adapter';

const customMockAdapter = new MockAdapter([
    { content: '自定义', delta: { content: '自' } },
    { content: '自定义', delta: { content: '定' } },
    { content: '自定义', delta: { content: '义' } }
]);
```

## 🔧 错误处理

```typescript
try {
    const response = await client.sendMessage('测试消息');
    for await (const chunk of response) {
        console.log(chunk);
    }
} catch (error) {
    console.error('请求失败:', error.message);
}
```

## 📁 项目结构

```
src/
├── api/
│   ├── protocol/          # 协议适配器
│   │   ├── sse_adapter.ts
│   │   ├── mock_adapter.ts
│   │   ├── protocol_adapter_manager.ts
│   │   └── protocol_types.ts
│   └── endpoints/         # API端点
├── clients/               # AI客户端
│   ├── qwen_client.ts
│   ├── baidu_client.ts
│   ├── deepseek_client.ts
│   ├── chatglm_client.ts
│   └── tongyi_client.ts
├── examples/              # 使用示例
│   ├── demo.ts
│   └── unified_protocol_examples.ts
└── types/                 # 类型定义
    └── ai_client_types.ts
```

## 🚀 运行演示

```bash
# 运行快速演示
node -r ts-node/register src/examples/demo.ts

# 运行完整示例
node -r ts-node/register src/examples/unified_protocol_examples.ts
```

## 🎯 核心优势

1. **统一接口**: 所有AI平台使用相同的API接口
2. **协议抽象**: 底层协议变化不影响上层使用
3. **易于扩展**: 支持添加新的AI平台和协议适配器
4. **开发友好**: Mock模式支持离线开发
5. **类型安全**: TypeScript完整类型支持
6. **向后兼容**: 保持现有代码的兼容性

## 🔮 未来扩展

- 支持更多AI平台
- 添加WebSocket协议适配器
- 实现连接池管理
- 添加重试和熔断机制
- 支持自定义协议适配器