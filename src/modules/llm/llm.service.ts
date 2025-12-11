import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AICore } from '../../ai/core/ai-core';

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  public aiCore: AICore;

  constructor() {
    this.logger.log('LLM Service initialized with DeepSeek client and AI Core');
  }

  public async onModuleInit() {
    this.aiCore = new AICore();
  }

  public async chat(message: string) {
    return this.aiCore.processMessage(message);
  }
}
