import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  EventType,
  EventStatus,
} from '../../../entities/timeline-event.entity';

const CreateTimelineEventSchema = z.object({
  agentId: z.string().uuid().describe('Agent ID'),
  name: z.string().min(1).max(100).describe('事件名称'),
  description: z.string().optional().describe('事件描述'),
  type: z.nativeEnum(EventType).default(EventType.MANUAL).describe('事件类型'),
  scheduledAt: z.string().datetime().optional().describe('计划执行时间'),
  cronExpression: z.string().optional().describe('Cron表达式'),
  intervalSeconds: z.number().int().positive().optional().describe('间隔秒数'),
  context: z.record(z.string(), z.any()).optional().describe('执行上下文'),
});

const UpdateTimelineEventSchema = z.object({
  name: z.string().min(1).max(100).optional().describe('事件名称'),
  description: z.string().optional().describe('事件描述'),
  status: z.nativeEnum(EventStatus).optional().describe('事件状态'),
  scheduledAt: z.string().datetime().optional().describe('计划执行时间'),
  cronExpression: z.string().optional().describe('Cron表达式'),
  intervalSeconds: z.number().int().positive().optional().describe('间隔秒数'),
  context: z.record(z.string(), z.any()).optional().describe('执行上下文'),
});

const TimelineEventIdSchema = z.object({
  id: z.string().uuid().describe('事件ID'),
});

const ListTimelineEventsSchema = z.object({
  agentId: z.string().uuid().optional().describe('Agent ID'),
  status: z.nativeEnum(EventStatus).optional().describe('事件状态'),
  type: z.nativeEnum(EventType).optional().describe('事件类型'),
  page: z.number().int().positive().default(1).describe('页码'),
  limit: z.number().int().positive().max(100).default(10).describe('每页数量'),
});

export class CreateTimelineEventDto extends createZodDto(
  CreateTimelineEventSchema,
) {}
export class UpdateTimelineEventDto extends createZodDto(
  UpdateTimelineEventSchema,
) {}
export class TimelineEventIdDto extends createZodDto(TimelineEventIdSchema) {}
export class ListTimelineEventsDto extends createZodDto(
  ListTimelineEventsSchema,
) {}

export class UpdateTimelineEventBodyDto extends createZodDto(
  z
    .object({
      id: z.string().uuid().describe('事件ID'),
    })
    .merge(UpdateTimelineEventSchema),
) {}
