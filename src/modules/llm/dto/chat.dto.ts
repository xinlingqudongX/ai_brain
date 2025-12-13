import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 发送消息DTO
export const SendMessageSchema = z.object({
  sessionId: z.string().uuid('会话ID必须是有效的UUID'),
  message: z.string().min(1, '消息内容不能为空').max(10000, '消息内容不能超过10000字符'),
  systemPrompt: z.string().optional(),
});

export class SendMessageDto extends createZodDto(SendMessageSchema) {}

// 创建会话DTO
export const CreateSessionSchema = z.object({
  sessionName: z.string().min(1, '会话名称不能为空').max(100, '会话名称不能超过100字符'),
});

export class CreateSessionDto extends createZodDto(CreateSessionSchema) {}

// 更新会话DTO
export const UpdateSessionSchema = z.object({
  sessionName: z.string().min(1, '会话名称不能为空').max(100, '会话名称不能超过100字符'),
});

export class UpdateSessionDto extends createZodDto(UpdateSessionSchema) {}

// 获取会话列表查询参数
export const GetSessionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export class GetSessionsQueryDto extends createZodDto(GetSessionsQuerySchema) {}

// 获取消息列表查询参数
export const GetMessagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export class GetMessagesQueryDto extends createZodDto(GetMessagesQuerySchema) {}

// 响应DTO类型
export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  tokens?: number;
  executionTime?: number;
  createdAt: number;
}

export interface ChatSessionResponse {
  id: string;
  sessionName: string;
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
  lastMessage?: string;
}

export interface SendMessageResponse {
  message: ChatMessageResponse;
  response: ChatMessageResponse;
  executionTime: number;
  tokensUsed?: number;
}