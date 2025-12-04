import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100).describe('Agent名称'),
  description: z.string().min(1).describe('Agent描述'),
  goal: z.string().min(1).describe('Agent目标'),
  config: z.record(z.string(), z.any()).optional().describe('Agent配置'),
  roleIds: z.array(z.string().uuid()).default([]).describe('关联的角色ID列表'),
  subscribedEvents: z.array(z.string()).default([]).describe('订阅的事件列表'),
});

const UpdateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional().describe('Agent名称'),
  description: z.string().min(1).optional().describe('Agent描述'),
  goal: z.string().min(1).optional().describe('Agent目标'),
  config: z.record(z.string(), z.any()).optional().describe('Agent配置'),
  isActive: z.boolean().optional().describe('是否激活'),
  roleIds: z.array(z.string().uuid()).optional().describe('关联的角色ID列表'),
  subscribedEvents: z.array(z.string()).optional().describe('订阅的事件列表'),
});

const AgentIdSchema = z.object({
  id: z.string().uuid().describe('Agent ID'),
});

const ListAgentsSchema = z.object({
  page: z.number().int().positive().default(1).describe('页码'),
  limit: z.number().int().positive().max(100).default(10).describe('每页数量'),
  search: z.string().optional().describe('搜索关键词'),
});

const ExecuteAgentSchema = z.object({
  id: z.string().uuid().describe('Agent ID'),
  context: z.record(z.string(), z.any()).optional().describe('执行上下文'),
});

export class CreateAgentDto extends createZodDto(CreateAgentSchema) {}
export class UpdateAgentDto extends createZodDto(UpdateAgentSchema) {}
export class AgentIdDto extends createZodDto(AgentIdSchema) {}
export class ListAgentsDto extends createZodDto(ListAgentsSchema) {}
export class ExecuteAgentDto extends createZodDto(ExecuteAgentSchema) {}

export class UpdateAgentBodyDto extends createZodDto(
  z
    .object({
      id: z.string().uuid().describe('Agent ID'),
    })
    .merge(UpdateAgentSchema),
) {}
