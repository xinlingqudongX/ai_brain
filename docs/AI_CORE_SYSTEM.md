# AI 核心系统

## 概述

AI 核心系统是一个完整的插件化AI处理框架，支持插件工具的创建、更新、加载、删除，以及AI回复的结构化解析。系统使用HTML标签形式的回复格式，支持 `<answer>`、`<tools>`、`<think>` 三种标签。

## 系统架构

```
src/ai/
├── core/                    # 核心组件
│   ├── plugin-manager.ts    # 插件管理器
│   ├── response-parser.ts   # 回复解析器
│   └── ai-core.ts          # AI核心处理器
├── clients/                 # AI客户端
│   └── deepseek.client.ts  # DeepSeek客户端
├── plugins/                 # 插件目录
│   └── filesystem/         # 文件系统插件示例
│       ├── plugin.json     # 插件配置
│       └── index.ts        # 插件实现
├── examples/               # 使用示例
│   ├── ai-core-usage.example.ts
│   └── deepseek-usage.example.ts
├── ai.module.ts           # AI模块
└── ai.controller.ts       # AI控制器
```

## 核心组件

### 1. PluginManager (插件管理器)

负责插件的生命周期管理，包括创建、加载、更新、删除插件。

**主要功能:**
- 创建新插件 (`createPlugin`)
- 加载插件 (`loadPlugin`, `loadAllPlugins`)
- 更新插件 (`updatePlugin`)
- 删除插件 (`deletePlugin`)
- 执行工具 (`executeTool`)
- 获取插件和工具信息

**插件结构:**
```typescript
interface Plugin {
  id: string;           // 插件唯一标识
  name: string;         // 插件名称
  description: string;  // 插件描述
  version: string;      // 版本号
  category: string;     // 分类
  tools: PluginTool[];  // 工具列表
  isActive: boolean;    // 是否启用
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

### 2. ResponseParser (回复解析器)

解析AI的结构化回复，支持HTML标签格式。

**支持的标签:**
- `<answer>回复内容</answer>` - AI的最终回复
- `<tools>工具调用</tools>` - 需要执行的工具
- `<think>思考过程</think>` - AI的思考过程

**工具调用格式:**
```json
[
  {
    "name": "tool_name",
    "parameters": {
      "param1": "value1",
      "param2": "value2"
    }
  }
]
```

### 3. AICore (AI核心处理器)

整合所有组件，提供完整的AI消息处理流程。

**处理流程:**
1. 接收用户消息
2. 构建执行上下文（包含可用工具）
3. 调用LLM生成回复
4. 解析回复结构
5. 执行工具调用
6. 处理工具执行结果
7. 返回最终结果

## API 接口

### HTTP 端点

所有接口使用 POST 方法，路径格式为 `/ai/action/{action}`：

#### 1. 处理消息

**POST** `/ai/action/process-message`

```json
{
  "message": "请帮我创建一个文件",
  "sessionId": "session_123",
  "userId": "user_456",
  "systemPrompt": "你是一个文件管理助手"
}
```

**响应:**
```json
{
  "sessionId": "session_123",
  "response": "<answer>我已经帮您创建了文件</answer>",
  "parsedResponse": {
    "answer": "我已经帮您创建了文件",
    "tools": [],
    "think": null,
    "raw": "<answer>我已经帮您创建了文件</answer>"
  },
  "toolResults": [],
  "executionTime": 1500
}
```

#### 2. 解析回复

**POST** `/ai/action/parse-response`

```json
{
  "response": "<think>需要创建文件</think><tools>[{\"name\":\"filesystem.create_file\",\"parameters\":{\"path\":\"/tmp/test.txt\",\"content\":\"Hello\"}}]</tools><answer>文件已创建</answer>"
}
```

#### 3. 插件管理

**POST** `/ai/action/get-plugins` - 获取所有插件
**POST** `/ai/action/get-tools` - 获取所有工具
**POST** `/ai/action/create-plugin` - 创建插件
**POST** `/ai/action/delete-plugin` - 删除插件
**POST** `/ai/action/reload-plugins` - 重新加载插件

#### 4. 工具测试

**POST** `/ai/action/test-tool`

```json
{
  "toolName": "filesystem.create_file",
  "parameters": {
    "path": "/tmp/test.txt",
    "content": "Hello World"
  }
}
```

## 插件开发

### 创建插件

1. **创建插件目录**
```bash
mkdir src/ai/plugins/my-plugin
```

2. **创建插件配置** (`plugin.json`)
```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "description": "插件描述",
  "version": "1.0.0",
  "category": "custom",
  "main": "index.ts",
  "tools": ["tool1", "tool2"]
}
```

3. **实现插件** (`index.ts`)
```typescript
import { PluginTool } from '../../core/plugin-manager';

const myTool: PluginTool = {
  name: 'my-plugin.my-tool',
  description: '我的工具',
  parameters: [
    {
      name: 'input',
      type: 'string',
      description: '输入参数',
      required: true,
    },
  ],
  async execute(input: string): Promise<string> {
    // 工具实现逻辑
    return `处理结果: ${input}`;
  },
};

export const tools: PluginTool[] = [myTool];

export const metadata = {
  id: 'my-plugin',
  name: '我的插件',
  description: '插件描述',
  version: '1.0.0',
  category: 'custom',
};
```

### 内置插件

#### 文件系统插件 (filesystem)

提供文件和目录操作功能，支持运行时数据记录和缓存：

**基础操作:**
- `filesystem.create_file` - 创建文件
- `filesystem.read_file` - 读取文件（支持缓存）
- `filesystem.write_file` - 写入文件
- `filesystem.delete_file` - 删除文件
- `filesystem.create_directory` - 创建目录
- `filesystem.list_directory` - 列出目录内容（支持缓存）
- `filesystem.file_exists` - 检查文件是否存在（支持缓存）
- `filesystem.directory_exists` - 检查目录是否存在（支持缓存）

**管理功能:**
- `filesystem.get_stats` - 获取插件统计信息
- `filesystem.get_call_history` - 获取调用历史记录
- `filesystem.clear_cache` - 清除缓存
- `filesystem.clear_history` - 清除调用历史

**特色功能:**
- **调用历史记录**: 记录每次工具调用的参数、结果、执行时间和成功状态
- **智能缓存**: 自动缓存文件读取、目录列表等操作结果，提高性能
- **统计分析**: 提供详细的使用统计，包括调用次数、成功率、平均执行时间等
- **缓存管理**: 支持TTL过期、手动清除、自动清理过期缓存

## 使用示例

### 在服务中使用

```typescript
import { Injectable } from '@nestjs/common';
import { AICore } from './ai/core/ai-core';

@Injectable()
export class ChatService {
  constructor(private readonly aiCore: AICore) {}

  async handleMessage(message: string, sessionId: string): Promise<string> {
    const result = await this.aiCore.processMessage(message, { sessionId });
    return result.parsedResponse.answer || result.response;
  }
}
```

### 直接API调用

```bash
# 处理消息
curl -X POST http://localhost:3000/ai/action/process-message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "请帮我创建一个名为 hello.txt 的文件，内容是 Hello World",
    "sessionId": "test_session"
  }'

# 获取所有工具
curl -X POST http://localhost:3000/ai/action/get-tools

# 测试工具
curl -X POST http://localhost:3000/ai/action/test-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "filesystem.create_file",
    "parameters": {
      "path": "/tmp/test.txt",
      "content": "Hello World"
    }
  }'
```

## AI回复格式规范

### 标准格式

```html
<think>
这里是AI的思考过程，用户不会直接看到，但会被记录用于调试和优化。
我需要分析用户的需求，然后决定是否需要使用工具。
</think>

<tools>
[
  {
    "name": "filesystem.create_file",
    "parameters": {
      "path": "/tmp/example.txt",
      "content": "文件内容"
    }
  }
]
</tools>

<answer>
我已经帮您创建了文件 /tmp/example.txt，内容为"文件内容"。
文件创建成功，您可以在指定路径找到该文件。
</answer>
```

### 仅回复格式

```html
<answer>
这是一个简单的回复，不需要使用任何工具。
</answer>
```

### 仅工具调用格式

```html
<tools>
[
  {
    "name": "filesystem.read_file",
    "parameters": {
      "path": "/tmp/config.json"
    }
  }
]
</tools>
```

## 配置和部署

### 环境变量

```bash
# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key

# 其他配置
NODE_ENV=development
```

### 启动应用

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 扩展和定制

### 添加新的AI客户端

1. 在 `src/ai/clients/` 目录下创建新的客户端
2. 实现统一的接口
3. 在 `AIModule` 中注册
4. 在 `AICore` 中集成

### 添加新的回复格式

1. 在 `ResponseParser` 中添加新的解析逻辑
2. 更新接口定义
3. 更新文档和示例

### 性能优化

- 插件懒加载
- 工具执行缓存
- 回复解析缓存
- 并发工具执行

## 故障排除

### 常见问题

1. **插件加载失败**
   - 检查插件目录结构
   - 验证 plugin.json 格式
   - 查看日志错误信息

2. **工具执行失败**
   - 检查工具参数格式
   - 验证权限设置
   - 查看具体错误信息

3. **回复解析失败**
   - 检查HTML标签格式
   - 验证JSON格式
   - 查看解析日志

### 调试技巧

- 启用详细日志
- 使用测试工具接口
- 检查插件状态
- 验证AI回复格式

## 安全考虑

1. **文件系统访问控制**
2. **工具执行权限限制**
3. **输入参数验证**
4. **错误信息过滤**
5. **资源使用限制**

## 未来规划

- 插件市场和分发
- 可视化插件管理界面
- 更多内置插件
- 性能监控和分析
- 多语言支持
- 插件版本管理
- 热更新支持