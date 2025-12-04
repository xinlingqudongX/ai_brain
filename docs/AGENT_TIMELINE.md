# Agent 和时间线功能文档

## 概述

本文档介绍 AI Brain 的 Agent 综合解决方案和线性时间线通知器功能。

## Agent 综合解决方案

### 什么是 Agent？

Agent 是为了解决具体问题而创建的综合解决方案。一个 Agent 可以：
- 包含多个角色（如 DBA、项目经理等）
- 拥有调用所有关联角色能力的权限
- 根据 AI 决策自动选择执行哪些能力
- 响应时间线事件自动执行任务

### Agent 数据结构

```typescript
{
  id: string;              // Agent 唯一标识
  name: string;            // Agent 名称
  description: string;     // Agent 描述
  goal: string;            // Agent 目标
  config: object;          // Agent 配置（可选）
  isActive: boolean;       // 是否激活
  roles: Role[];           // 关联的角色列表
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
}
```

### Agent API

#### 创建 Agent
**POST** `/api/v1/agents/action/create`

```json
{
  "name": "数据库维护Agent",
  "description": "负责数据库的日常维护和优化",
  "goal": "确保数据库稳定运行，性能最优",
  "config": {
    "checkInterval": 3600,
    "alertThreshold": 0.8
  },
  "roleIds": ["dba-role-id", "devops-role-id"]
}
```

#### 查询 Agent 列表
**POST** `/api/v1/agents/action/list`

```json
{
  "page": 1,
  "limit": 10,
  "search": "数据库"
}
```

#### 获取 Agent 详情
**POST** `/api/v1/agents/action/get`

```json
{
  "id": "agent-uuid"
}
```

#### 更新 Agent
**POST** `/api/v1/agents/action/update`

```json
{
  "id": "agent-uuid",
  "name": "高级数据库维护Agent",
  "description": "更新后的描述",
  "isActive": true,
  "roleIds": ["dba-role-id", "devops-role-id", "security-role-id"]
}
```

#### 删除 Agent
**POST** `/api/v1/agents/action/delete`

```json
{
  "id": "agent-uuid"
}
```

#### 执行 Agent
**POST** `/api/v1/agents/action/execute`

```json
{
  "id": "agent-uuid",
  "context": {
    "task": "检查数据库性能",
    "priority": "high"
  }
}
```

## 线性时间线通知器

### 什么是时间线事件？

时间线事件是定时或周期性触发 Agent 执行的机制。支持多种事件类型：

- **MANUAL**: 手动触发
- **SCHEDULED**: 定时触发（一次性）
- **INTERVAL**: 间隔触发（周期性）
- **CRON**: Cron 表达式触发（未来扩展）

### 事件状态

- **PENDING**: 等待执行
- **PROCESSING**: 执行中
- **COMPLETED**: 已完成
- **FAILED**: 执行失败
- **CANCELLED**: 已取消

### 时间线事件数据结构

```typescript
{
  id: string;                // 事件唯一标识
  name: string;              // 事件名称
  description: string;       // 事件描述
  type: EventType;           // 事件类型
  status: EventStatus;       // 事件状态
  scheduledAt: Date;         // 计划执行时间
  cronExpression: string;    // Cron 表达式
  intervalSeconds: number;   // 间隔秒数
  context: object;           // 执行上下文
  result: object;            // 执行结果
  error: string;             // 错误信息
  executedAt: Date;          // 实际执行时间
  completedAt: Date;         // 完成时间
  agent: Agent;              // 关联的 Agent
  createdAt: Date;           // 创建时间
}
```

### 时间线 API

#### 创建时间线事件
**POST** `/api/v1/timeline/action/create`

**定时事件示例**:
```json
{
  "agentId": "agent-uuid",
  "name": "每日数据库备份",
  "description": "每天凌晨2点执行数据库备份",
  "type": "scheduled",
  "scheduledAt": "2024-12-05T02:00:00Z",
  "context": {
    "backupType": "full",
    "retention": 7
  }
}
```

**间隔事件示例**:
```json
{
  "agentId": "agent-uuid",
  "name": "性能监控",
  "description": "每小时检查一次数据库性能",
  "type": "interval",
  "intervalSeconds": 3600,
  "context": {
    "metrics": ["cpu", "memory", "connections"]
  }
}
```

#### 查询时间线事件列表
**POST** `/api/v1/timeline/action/list`

```json
{
  "agentId": "agent-uuid",
  "status": "pending",
  "type": "interval",
  "page": 1,
  "limit": 10
}
```

#### 获取事件详情
**POST** `/api/v1/timeline/action/get`

```json
{
  "id": "event-uuid"
}
```

#### 更新事件
**POST** `/api/v1/timeline/action/update`

```json
{
  "id": "event-uuid",
  "name": "更新后的事件名称",
  "status": "pending",
  "scheduledAt": "2024-12-06T02:00:00Z"
}
```

#### 删除事件
**POST** `/api/v1/timeline/action/delete`

```json
{
  "id": "event-uuid"
}
```

#### 手动执行事件
**POST** `/api/v1/timeline/action/execute`

```json
{
  "id": "event-uuid"
}
```

## 完整使用示例

### 场景：创建数据库维护 Agent

#### 1. 创建能力

```bash
# 创建数据库备份能力
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "数据库备份",
    "description": "执行数据库备份操作",
    "prompt": "你可以执行数据库的完整备份和增量备份"
  }'

# 创建性能监控能力
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "性能监控",
    "description": "监控数据库性能指标",
    "prompt": "你可以监控CPU、内存、连接数等性能指标"
  }'

# 创建查询优化能力
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "查询优化",
    "description": "分析和优化慢查询",
    "prompt": "你可以分析慢查询日志并提供优化建议"
  }'
```

#### 2. 创建 DBA 角色

```bash
curl -X POST http://localhost:3000/api/v1/roles/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DBA",
    "description": "数据库管理员",
    "prompt": "你是一名专业的数据库管理员",
    "capabilityIds": ["备份能力ID", "监控能力ID", "优化能力ID"]
  }'
```

#### 3. 创建 Agent

```bash
curl -X POST http://localhost:3000/api/v1/agents/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "数据库维护Agent",
    "description": "负责数据库的日常维护工作",
    "goal": "确保数据库稳定运行，性能最优，数据安全",
    "config": {
      "database": "production",
      "alertEmail": "admin@example.com"
    },
    "roleIds": ["DBA角色ID"]
  }'
```

#### 4. 创建定时备份事件

```bash
curl -X POST http://localhost:3000/api/v1/timeline/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "Agent的ID",
    "name": "每日数据库备份",
    "description": "每天凌晨2点执行完整备份",
    "type": "scheduled",
    "scheduledAt": "2024-12-05T02:00:00Z",
    "context": {
      "task": "backup",
      "backupType": "full"
    }
  }'
```

#### 5. 创建性能监控事件

```bash
curl -X POST http://localhost:3000/api/v1/timeline/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "Agent的ID",
    "name": "性能监控",
    "description": "每小时检查数据库性能",
    "type": "interval",
    "intervalSeconds": 3600,
    "context": {
      "task": "monitor",
      "metrics": ["cpu", "memory", "connections", "slow_queries"]
    }
  }'
```

## 工作流程

### Agent 执行流程

1. **触发**: 时间线事件到达执行时间
2. **通知**: 系统触发 `agent.execute` 事件
3. **决策**: Agent 根据上下文和 AI 决策选择执行哪些能力
4. **执行**: 调用相应角色的能力
5. **记录**: 记录执行结果和状态

### 事件调度机制

- **定时事件**: 使用 `setTimeout` 在指定时间执行
- **间隔事件**: 使用 `setInterval` 周期性执行
- **检查机制**: 每分钟检查一次待执行的事件
- **自动清理**: Agent 删除时自动取消相关事件

## 事件系统

系统使用 EventEmitter2 实现事件驱动架构：

### 事件类型

- `agent.created`: Agent 创建时触发
- `agent.updated`: Agent 更新时触发
- `agent.deleted`: Agent 删除时触发
- `agent.execute`: Agent 执行时触发

### 监听事件

```typescript
@OnEvent('agent.execute')
async handleAgentExecute(payload: { agent: Agent; context: any }) {
  // 处理 Agent 执行逻辑
  // 这里可以集成 AI 决策系统
}
```

## 扩展建议

### 1. AI 决策集成

在 `agent.execute` 事件处理器中集成 AI 模型：

```typescript
@OnEvent('agent.execute')
async handleAgentExecute(payload: { agent: Agent; context: any }) {
  // 1. 收集 Agent 的所有能力
  const capabilities = agent.roles.flatMap(role => role.capabilities);
  
  // 2. 调用 AI 决策
  const decision = await this.aiService.decide({
    goal: agent.goal,
    context: payload.context,
    capabilities: capabilities
  });
  
  // 3. 执行选中的能力
  for (const capability of decision.selectedCapabilities) {
    await this.executeCapability(capability, payload.context);
  }
}
```

### 2. 结果追踪

扩展时间线事件，记录详细的执行结果：

```typescript
event.result = {
  success: true,
  executedCapabilities: ['备份', '监控'],
  metrics: {
    duration: 120,
    itemsProcessed: 1000
  },
  aiDecision: {
    reasoning: "根据当前负载选择执行备份和监控",
    confidence: 0.95
  }
};
```

### 3. 告警机制

当事件执行失败时发送告警：

```typescript
if (event.status === EventStatus.FAILED) {
  await this.alertService.send({
    level: 'error',
    message: `Agent ${agent.name} 执行失败`,
    error: event.error,
    context: event.context
  });
}
```

### 4. Cron 表达式支持

实现 Cron 表达式解析和调度：

```typescript
@Cron(event.cronExpression)
async executeCronEvent() {
  await this.executeEvent(event.id);
}
```

## 最佳实践

1. **合理设置间隔**: 避免过于频繁的执行导致系统负载过高
2. **上下文传递**: 通过 context 传递必要的执行参数
3. **错误处理**: 确保 Agent 执行逻辑有完善的错误处理
4. **监控日志**: 记录所有事件的执行情况便于追踪
5. **资源清理**: Agent 删除时确保清理所有相关资源

## 注意事项

1. **时区处理**: scheduledAt 使用 UTC 时间
2. **并发控制**: 同一 Agent 的多个事件可能并发执行
3. **长时间运行**: 避免 Agent 执行时间过长阻塞系统
4. **数据一致性**: 确保事件状态更新的原子性
