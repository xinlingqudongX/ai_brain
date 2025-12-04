import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateTimelineNotifierSchema = z.object({
  eventName: z.string().min(1).max(100).describe('事件名称'),
  description: z.string().min(1).describe('事件描述'),
  cronExpression: z
    .string()
    .min(1)
    .describe('Cron表达式，如: 0 0 * * * (每小时), 0 0 2 * * * (每天凌晨2点)'),
  context: z.record(z.string(), z.any()).optional().describe('事件上下文数据'),
});

const UpdateTimelineNotifierSchema = z.object({
  eventName: z.string().min(1).max(100).optional().describe('事件名称'),
  description: z.string().min(1).optional().describe('事件描述'),
  cronExpression: z.string().min(1).optional().describe('Cron表达式'),
  isEnabled: z.boolean().optional().describe('是否启用'),
  context: z.record(z.string(), z.any()).optional().describe('事件上下文数据'),
});

const TimelineNotifierIdSchema = z.object({
  id: z.string().uuid().describe('通知器ID'),
});

const ListTimelineNotifiersSchema = z.object({
  page: z.number().int().positive().default(1).describe('页码'),
  limit: z.number().int().positive().max(100).default(10).describe('每页数量'),
  search: z.string().optional().describe('搜索关键词'),
  isEnabled: z.boolean().optional().describe('是否启用'),
});

export class CreateTimelineNotifierDto extends createZodDto(
  CreateTimelineNotifierSchema,
) {}
export class UpdateTimelineNotifierDto extends createZodDto(
  UpdateTimelineNotifierSchema,
) {}
export class TimelineNotifierIdDto extends createZodDto(
  TimelineNotifierIdSchema,
) {}
export class ListTimelineNotifiersDto extends createZodDto(
  ListTimelineNotifiersSchema,
) {}

export class UpdateTimelineNotifierBodyDto extends createZodDto(
  z
    .object({
      id: z.string().uuid().describe('通知器ID'),
    })
    .merge(UpdateTimelineNotifierSchema),
) {}
