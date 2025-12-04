# CIIA 智能交互控制台 - 前端项目

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Pinia** - Vue 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口封装
│   ├── components/       # Vue 组件
│   │   ├── drawer/       # 配置抽屉子组件
│   │   ├── AgentCard.vue
│   │   ├── AppHeader.vue
│   │   ├── ConfigDrawer.vue
│   │   └── ExecutionMonitor.vue
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── index.html
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
├── tsconfig.json         # TypeScript 配置
└── package.json
```

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建输出到 `../src/static` 目录

## 功能特性

### 1. 智能体概览 (Agent Grid)
- 卡片式展示所有 Agent
- 显示状态、能力数量、订阅事件数
- 点击卡片打开配置抽屉

### 2. 实时执行监控 (Execution Call Stack)
- 流程图样式展示执行步骤
- 实时状态反馈（成功/失败/处理中）
- 显示执行耗时和详细信息

### 3. 统一配置抽屉 (Config Drawer)

#### 栏目一：角色设定
- Agent 名称、描述、目标配置
- 人设 Prompt 编辑
- 最终 Prompt 预览

#### 栏目二：能力装配
- 分类标签页（核心、DevOps、数据、生活）
- 搜索功能
- 多选能力授权

#### 栏目三：事件订阅
- 时间轴样式展示订阅的事件
- 添加/删除事件订阅
- 快速添加常用事件

## API 集成

前端通过 Axios 与后端 NestJS API 通信：

- **Agents API**: `/api/v1/agents/action/*`
- **Roles API**: `/api/v1/roles/action/*`
- **Capabilities API**: `/api/v1/capabilities/action/*`
- **Timeline API**: `/api/v1/timeline/action/*`

所有 API 使用 POST 请求，参数在请求体中。

## 设计规范

### 配色
- 主背景: `#111827`
- 卡片背景: `#1f2937`
- 强调色: `#3b82f6` (蓝色)
- 成功色: `#10b981` (绿色)
- 错误色: `#ef4444` (红色)

### 组件规范
- 使用 Composition API
- TypeScript 类型安全
- 响应式设计
- 暗黑主题

## 开发注意事项

1. **状态管理**: 使用 Pinia Store 管理全局状态
2. **类型定义**: 所有 API 响应都有对应的 TypeScript 类型
3. **错误处理**: API 调用需要 try-catch 处理错误
4. **响应式**: 使用 Tailwind 的响应式类名适配不同屏幕

## 部署

构建后的文件会输出到 `../src/static` 目录，NestJS 会自动提供静态文件服务。

访问 `http://localhost:3000` 即可看到前端界面。
