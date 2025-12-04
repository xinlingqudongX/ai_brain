# 时间线通知器文档

## 概述

时间线通知器是一个基于事件广播的定时任务系统。通过创建定时任务，系统会在指定时间广播事件，订阅了该事件的 Agent 会收到通知并执行相应的操作。

## 核心概念

### 1. 时间线通知器 (Timeline Notifier)

时间线通知器定义了一个定时任务，包含：
- **事件名称**: 唯一标识，Agent 通过此名称订阅事件
- **Cron 表达式**: 定义任务执行的时间规则
- **事件上下文**: 广播时携带的数据

### 2. 事件订阅

Agent 可以配置订阅的事件列表：
- Agent 创建时指定 `subscribedEvents` 数组
- 包含要订阅的事件名称列表
- 当事件广播时，只有订阅了该事件的 Agent 会收到通知

### 3. 事件广播

当定时任务触发时：
1. 系统查找所有订阅了该事件的激活 Agent
2. 向每个 Agent 广播 `timeline.event` 事件
3. Agent 可以监听此事件并执行相应逻辑

## 工作流程

```
1. 创建时间线通知器
   ↓
2. 系统注册 Cron 任务
   ↓
3. 到达执行时间
   ↓
4. 查找订阅了该事件的 Agent
   ↓
5. 广播 timeline.event 事件
   ↓
6. Agent 监听器接收事件
   ↓
7. Agent 执行相应操作
```

## API 使用

### 创建时间线通知器

**POST** `/api/v1/timeline/action/create`

```json
{
  "eventName": "daily.backup",
  "description": "每日数据库备份事件",
  "cronExpression": "0 0 2 * * *",
  "context": {
    "type": "backup",
    "priority": "high"
  }
}
```

**Cron 表达式格式**: `秒 分 时 日 月 星期`

常用示例：
- `0 0 * * * *` - 每小时
- `0 0 2 * * *` - 每天凌晨2点
- `0 */30 * * * *` - 每30分钟
- `0 0 9 * * 1-5` - 工作日早上9点
- `0 0 0 1 * *` - 每月1号凌晨

### 创建订阅事件的 Agent

**POST** `/api/v1/agents/action/create`

```json
{
  "name": "数据库维护Agent",
  "description": "负责数据库维护工作",
  "goal": "确保数据库稳定运行",
  "roleIds": ["dba-role-id"],
  "subscribedEvents": ["daily.backup", "hourly.monitor"]
}
```

### 查询通知器列表

**POST** `/api/v1/timeline/action/list`

```json
{
  "page": 1,
  "limit": 10,
  "search": "backup",
  "isEnabled": true
}
```

### 更新通知器

**POST** `/api/v1/timeline/action/update`

```json
{
  "id": "notifier-uuid",
  "cronExpression": "0 0 3 * * *",
  "isEnabled": true
}
```

### 手动触发事件

**POST** `/api/v1/timeline/action/trigger`

```json
{
  "id": "notifier-uuid"
}
```

### 删除通知器

**POST** `/api/v1/timeline/action/delete`

```json
{
  "id": "notifier-uuid"
}
```

## 完整示例

### 场景：数据库定时维护

#### 1. 创建 DBA 角色和能力

```bash
# 创建备份能力
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "数据库备份",
    "description": "执行数据库备份",
    "prompt": "你可以执行完整备份和增量备份"
  }'

# 创建监控能力
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "性能监控",
    "description": "监控数据库性能",
    "prompt": "你可以监控CPU、内存、连接数等指标"
  }'

# 创建 DBA 角色
curl -X POST http://localhost:3000/api/v1/roles/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DBA",
    "description": "数据库管理员",
    "prompt": "你是专业的数据库管理员",
    "capabilityIds": ["备份能力ID", "监控能力ID"]
  }'
```

#### 2. 创建时间线通知器

```bash
# 每日备份事件
curl -X POST http://localhost:3000/api/v1/timeline/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "daily.backup",
    "description": "每日凌晨2点执行数据库备份",
    "cronExpression": "0 0 2 * * *",
    "context": {
      "task": "backup",
      "type": "full"
    }
  }'

# 每小时监控事件
curl -X POST http://localhost:3000/api/v1/timeline/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "hourly.monitor",
    "description": "每小时检查数据库性能",
    "cronExpression": "0 0 * * * *",
    "context": {
      "task": "monitor",
      "metrics": ["cpu", "memory", "connections"]
    }
  }'
```

#### 3. 创建订阅事件的 Agent

```bash
curl -X POST http://localhost:3000/api/v1/agents/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "数据库维护Agent",
    "description": "负责数据库的日常维护工作",
    "goal": "确保数据库稳定运行，性能最优",
    "config": {
      "database": "production",
      "alertEmail": "admin@example.com"
    },
    "roleIds": ["DBA角色ID"],
    "subscribedEvents": ["daily.backup", "hourly.monitor"]
  }'
```

#### 4. 实现事件监听器

在你的代码中监听 `timeline.event` 事件：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AgentExecutor {
  private readonly logger = new Logger(AgentExecutor.name);

  @OnEvent('timeline.event')
  async handleTimelineEvent(payload: {
    eventName: string;
    agent: AgentEntity;
    context: any;
    timestamp: Date;
  }) {
    this.logger.log(`Agent ${payload.agent.name} received event: ${payload.eventName}`);

    // 根据事件名称和上下文执行不同的操作
    switch (payload.eventName) {
      case 'daily.backup':
        await this.executeBackup(payload.agent, payload.context);
        break;
      case 'hourly.monitor':
        await this.executeMonitoring(payload.agent, payload.context);
        break;
      default:
        this.logger.warn(`Unknown event: ${payload.eventName}`);
    }
  }

  private async executeBackup(agent: AgentEntity, context: any) {
    // 执行备份逻辑
    this.logger.log(`Executing backup for agent: ${agent.name}`);
    
    // 1. 收集 Agent 的所有能力
    const capabilities = agent.roles.flatMap(role => role.capabilities);
    
    // 2. 找到备份能力
    const backupCapability = capabilities.find(c => c.name === '数据库备份');
    
    // 3. 执行备份
    if (backupCapability) {
      // 这里可以调用 AI 决策或直接执行
      await this.performBackup(context);
    }
  }

  private async executeMonitoring(agent: AgentEntity, context: any) {
    // 执行监控逻辑
    this.logger.log(`Executing monitoring for agent: ${agent.name}`);
    
    const capabilities = agent.roles.flatMap(role => role.capabilities);
    const monitorCapability = capabilities.find(c => c.name === '性能监控');
    
    if (monitorCapability) {
      await this.performMonitoring(context);
    }
  }

  private async performBackup(context: any) {
    // 实际的备份逻辑
    this.logger.log(`Performing ${context.type} backup...`);
  }

  private async performMonitoring(context: any) {
    // 实际的监控逻辑
    this.logger.log(`Monitoring metrics: ${context.metrics.join(', ')}`);
  }
}
```

## 事件数据结构

### timeline.event 事件 Payload

```typescript
{
  eventName: string;      // 事件名称
  agent: AgentEntity;     // 接收事件的 Agent（包含角色和能力）
  context: any;           // 事件上下文数据
  timestamp: Date;        // 事件触发时间
}
```

### Agent 实体

```typescript
{
  id: string;
  name: string;
  description: string;
  goal: string;
  config: object;
  isActive: boolean;
  subscribedEvents: string[];  // 订阅的事件列表
  roles: Role[];               // 关联的角色
}
```

## 优势

### 1. 解耦设计
- 通知器和 Agent 完全解耦
- Agent 通过事件名称订阅，不需要知道通知器的实现
- 可以动态添加/删除订阅

### 2. 灵活配置
- Agent 可以订阅多个事件
- 一个事件可以被多个 Agent 订阅
- 支持动态修改订阅列表

### 3. 易于扩展
- 新增事件只需创建通知器
- Agent 可以随时订阅新事件
- 事件处理逻辑独立实现

### 4. 可观测性
- 记录每次事件广播
- 追踪 Agent 接收情况
- 统计执行次数和时间

## 最佳实践

### 1. 事件命名规范

使用分层命名：
- `daily.backup` - 每日备份
- `hourly.monitor` - 每小时监控
- `weekly.report` - 每周报告
- `monthly.cleanup` - 每月清理

### 2. 上下文数据

在 context 中包含必要信息：
```json
{
  "task": "backup",
  "type": "full",
  "priority": "high",
  "retryCount": 3,
  "timeout": 3600
}
```

### 3. 错误处理

在事件监听器中添加错误处理：
```typescript
@OnEvent('timeline.event')
async handleTimelineEvent(payload: any) {
  try {
    await this.processEvent(payload);
  } catch (error) {
    this.logger.error(`Failed to process event: ${error.message}`);
    // 发送告警
    await this.alertService.send({
      level: 'error',
      message: `Agent ${payload.agent.name} failed to process event ${payload.eventName}`,
      error: error.message
    });
  }
}
```

### 4. 性能优化

- 避免在事件处理器中执行长时间操作
- 使用队列处理耗时任务
- 限制并发执行的 Agent 数量

### 5. 监控和日志

记录关键信息：
- 事件触发时间
- 接收 Agent 列表
- 执行结果
- 错误信息

## 注意事项

1. **Cron 表达式验证**: 创建通知器前验证 Cron 表达式的正确性
2. **时区设置**: 默认使用 Asia/Shanghai 时区
3. **事件名称唯一**: 每个通知器的事件名称必须唯一
4. **Agent 激活状态**: 只有激活的 Agent 才会收到事件
5. **订阅列表更新**: 修改 Agent 的订阅列表后立即生效
6. **通知器启用状态**: 禁用的通知器不会触发事件

## 故障排查

### 事件没有触发

1. 检查通知器是否启用
2. 验证 Cron 表达式是否正确
3. 查看系统日志

### Agent 没有收到事件

1. 确认 Agent 是否激活
2. 检查 subscribedEvents 是否包含事件名称
3. 验证事件名称是否匹配（区分大小写）

### 事件处理失败

1. 查看事件监听器的错误日志
2. 检查 Agent 的角色和能力配置
3. 验证上下文数据是否完整

## 扩展示例

### 多环境支持

```typescript
// 开发环境：每分钟执行
{
  "eventName": "dev.test",
  "cronExpression": "0 * * * * *",
  "context": { "env": "development" }
}

// 生产环境：每天执行
{
  "eventName": "prod.backup",
  "cronExpression": "0 0 2 * * *",
  "context": { "env": "production" }
}
```

### 条件执行

在事件监听器中根据条件执行：

```typescript
@OnEvent('timeline.event')
async handleTimelineEvent(payload: any) {
  // 根据环境决定是否执行
  if (payload.context.env === 'production' && !this.isMaintenanceMode()) {
    await this.execute(payload);
  }
}
```

### 链式事件

一个事件触发后可以触发其他事件：

```typescript
@OnEvent('timeline.event')
async handleTimelineEvent(payload: any) {
  if (payload.eventName === 'daily.backup') {
    await this.performBackup();
    
    // 备份完成后触发验证事件
    this.eventEmitter.emit('timeline.event', {
      eventName: 'backup.verify',
      agent: payload.agent,
      context: { backupId: 'xxx' },
      timestamp: new Date()
    });
  }
}
```
