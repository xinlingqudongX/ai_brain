import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100).describe('角色名称'),
  description: z.string().min(1).describe('角色描述'),
  prompt: z.string().min(1).describe('角色提示词'),
  group: z.string().min(0).max(100).describe('角色分组'),
  capabilityIds: z.array(z.uuid()).default([]).describe('关联的能力ID列表'),
});

const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional().describe('角色名称'),
  description: z.string().min(1).optional().describe('角色描述'),
  prompt: z.string().min(1).optional().describe('角色提示词'),
  group: z.string().min(0).max(100).optional().describe('角色分组'),
  isActive: z.boolean().optional().describe('是否激活'),
  capabilityIds: z
    .array(z.string().uuid())
    .optional()
    .describe('关联的能力ID列表'),
});

const RoleIdSchema = z.object({
  id: z.uuid().describe('角色ID'),
});

const ListRolesSchema = z.object({
  page: z.number().int().positive().default(1).describe('页码'),
  limit: z
    .number()
    .int()
    .positive()
    .max(10000)
    .default(10)
    .describe('每页数量'),
  search: z.string().optional().describe('搜索关键词'),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
export class RoleIdDto extends createZodDto(RoleIdSchema) {}
export class ListRolesDto extends createZodDto(ListRolesSchema) {}

export class UpdateRoleBodyDto extends createZodDto(
  z
    .object({
      id: z.string().uuid().describe('角色ID'),
    })
    .merge(UpdateRoleSchema),
) {}
