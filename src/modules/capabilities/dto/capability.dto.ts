import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateCapabilitySchema = z.object({
  name: z.string().min(1).max(100).describe('能力名称'),
  description: z.string().min(1).describe('能力描述'),
  prompt: z.string().min(1).describe('能力提示词'),
});

const UpdateCapabilitySchema = z.object({
  name: z.string().min(1).max(100).optional().describe('能力名称'),
  description: z.string().min(1).optional().describe('能力描述'),
  prompt: z.string().min(1).optional().describe('能力提示词'),
  isActive: z.boolean().optional().describe('是否激活'),
});

const CapabilityIdSchema = z.object({
  id: z.string().uuid().describe('能力ID'),
});

const ListCapabilitiesSchema = z.object({
  page: z.number().int().positive().default(1).describe('页码'),
  limit: z.number().int().positive().max(100).default(10).describe('每页数量'),
  search: z.string().optional().describe('搜索关键词'),
});

export class CreateCapabilityDto extends createZodDto(CreateCapabilitySchema) {}
export class UpdateCapabilityDto extends createZodDto(UpdateCapabilitySchema) {}
export class CapabilityIdDto extends createZodDto(CapabilityIdSchema) {}
export class ListCapabilitiesDto extends createZodDto(ListCapabilitiesSchema) {}

export class UpdateCapabilityBodyDto extends createZodDto(
  z
    .object({
      id: z.string().uuid().describe('能力ID'),
    })
    .merge(UpdateCapabilitySchema),
) {}
