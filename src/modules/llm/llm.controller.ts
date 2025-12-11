import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';
import { DeepSeekMessage } from '../../ai/clients/deepseek.client';

interface SendMessageDto {
  message: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatDto {
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
}

interface ChatWithSystemDto {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('action/get-models')
  async getModels(): Promise<{ models: string[] }> {
    return { models: [] };
  }
}
