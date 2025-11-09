# AI Brain

## 项目简介

AI Brain 是一个多平台AI客户端集成系统，旨在为开发者提供统一的接口来访问和管理不同AI平台的服务。通过本项目，您可以轻松地在百度、通义千问、ChatGLM、DeepSeek等AI平台之间切换，而无需关心各平台之间的差异。

## 支持的AI平台

- 百度AI
- 通义千问(Tongyi/Qwen)
- ChatGLM
- DeepSeek

## 项目架构

```
src/
├── api/
│   └── endpoints/
│       ├── ai_client_factory.ts         # 客户端工厂类
│       ├── base_ai_client.ts            # 基础AI客户端抽象类
│       └── unified_ai_client.ts         # 统一AI客户端
├── clients/
│   ├── baidu_client.ts                 # 百度AI客户端实现
│   ├── chatglm_client.ts               # ChatGLM客户端实现
│   ├── deepseek_client.ts              # DeepSeek客户端实现
│   ├── qwen_client.ts                  # 通义千问(Qwen)客户端实现
│   └── tongyi_client.ts                # 通义千问(Tongyi)客户端实现
├── types/
│   └── ai_client_types.ts              # 类型定义文件
└── docs/
    └── structure.md                    # 项目结构说明文档
```

## 核心组件

### 1. 基础抽象类 (BaseAIClient)

提供了所有AI客户端的通用功能，包括认证信息管理、UUID生成等。

### 2. 客户端接口 (AIPlatformClientInterface)

定义了所有AI客户端必须实现的标准接口，确保一致性。

### 3. 客户端工厂 (AIClientFactory)

使用工厂模式创建不同平台的客户端实例，简化客户端初始化过程。

### 4. 统一客户端 (UnifiedAIClient)

提供统一的接口来使用不同的AI平台，支持平台间无缝切换。

## 使用示例

```typescript
import { UnifiedAIClient, AIPlatformType } from './src/api/endpoints/unified_ai_client';
import { ClientCredentials } from './src/types/ai_client_types';

// 初始化客户端
const credentials: ClientCredentials = {
  cookies: "your_cookies_here"
};

const client = new UnifiedAIClient(AIPlatformType.CHATGLM, credentials);

// 发送消息
const response = await client.sendMessage("你好，世界！");
for await (const chunk of response) {
  console.log(chunk);
}

// 切换到其他平台
client.switchPlatform(AIPlatformType.TONGYI, newCredentials);
```

## 安装和运行

1. 克隆项目仓库
2. 安装依赖：`npm install`
3. 构建项目：`npm run build`
4. 运行示例：`npm run example`

## 贡献指南

欢迎提交Issue和Pull Request来改进本项目。

## 许可证

MIT License