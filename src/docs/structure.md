# 项目结构说明

## 目录结构

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

## 各目录功能说明

### api/endpoints/
该目录包含核心的API端点实现：
- `ai_client_factory.ts`: 客户端工厂类，用于根据平台类型创建对应的客户端实例
- `base_ai_client.ts`: 基础AI客户端抽象类，实现所有AI客户端的通用功能
- `unified_ai_client.ts`: 统一AI客户端，提供统一的接口来使用不同的AI平台

### clients/
该目录包含各个AI平台的具体客户端实现：
- `baidu_client.ts`: 百度AI平台客户端实现
- `chatglm_client.ts`: ChatGLM平台客户端实现
- `deepseek_client.ts`: DeepSeek平台客户端实现
- `qwen_client.ts`: 通义千问(Qwen)平台客户端实现
- `tongyi_client.ts`: 通义千问(Tongyi)平台客户端实现

### types/
该目录包含项目中使用的类型定义：
- `ai_client_types.ts`: 定义了AI平台类型枚举、客户端认证信息接口、消息发送选项接口以及AI平台客户端接口

### docs/
该目录包含项目文档：
- `structure.md`: 项目结构说明文档