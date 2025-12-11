import OpenAI from 'openai';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekClient {
  private readonly logger = console;
  private readonly client: OpenAI;
  private readonly defaultModel = 'deepseek-chat';
  #clientConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  };

  constructor(credentials: { apiKey: string; baseURL: string }) {
    this.#clientConfig = credentials;

    this.client = new OpenAI({
      apiKey: this.#clientConfig.apiKey,
      baseURL: this.#clientConfig.baseURL,
    });

    this.logger.log('DeepSeek client initialized');
  }

  /**
   * 发送单条消息到 DeepSeek
   */
  async sendMessage(
    message: string,
    options: DeepSeekChatOptions = {},
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await this.chat(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * 发送多轮对话消息
   */
  async chat(
    messages: DeepSeekMessage[],
    options: DeepSeekChatOptions = {},
  ): Promise<DeepSeekResponse> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 4000,
      stream = false,
    } = options;

    this.logger.log(`Sending chat request with ${messages.length} messages`);

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages:
          messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
        stream: false, // 确保不是流式响应
      });

      this.logger.log(
        `Chat response received, tokens used: ${response.usage?.total_tokens || 'unknown'}`,
      );

      return response as DeepSeekResponse;
    } catch (error) {
      this.logger.error(`DeepSeek API error: ${error.message}`);
      throw new Error(`DeepSeek API call failed: ${error.message}`);
    }
  }

  /**
   * 流式发送消息
   */
  async *chatStream(
    messages: DeepSeekMessage[],
    options: DeepSeekChatOptions = {},
  ): AsyncGenerator<string, void, unknown> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 4000,
    } = options;

    this.logger.log(`Starting stream chat with ${messages.length} messages`);

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages:
          messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

      this.logger.log('Stream chat completed');
    } catch (error) {
      this.logger.error(`DeepSeek stream error: ${error.message}`);
      throw new Error(`DeepSeek stream failed: ${error.message}`);
    }
  }

  /**
   * 带系统提示词的对话
   */
  async chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    options: DeepSeekChatOptions = {},
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await this.chat(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * 多轮对话（保持上下文）
   */
  async multiTurnChat(
    conversationHistory: DeepSeekMessage[],
    newMessage: string,
    options: DeepSeekChatOptions = {},
  ): Promise<{ response: string; updatedHistory: DeepSeekMessage[] }> {
    const messages: DeepSeekMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: newMessage,
      },
    ];

    const response = await this.chat(messages, options);
    const assistantMessage = response.choices[0]?.message?.content || '';

    const updatedHistory: DeepSeekMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: assistantMessage,
      },
    ];

    return {
      response: assistantMessage,
      updatedHistory,
    };
  }

  /**
   * 简单文本补全
   */
  async complete(
    prompt: string,
    options: DeepSeekChatOptions = {},
  ): Promise<string> {
    return this.sendMessage(prompt, options);
  }

  /**
   * 检查 API 连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.sendMessage('Hello', { maxTokens: 10 });
      this.logger.log('DeepSeek connection check successful');
      return true;
    } catch (error) {
      this.logger.error(`DeepSeek connection check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      const modelIds = response.data.map((model) => model.id);
      this.logger.log(`Retrieved ${modelIds.length} models from DeepSeek`);
      return modelIds;
    } catch (error) {
      this.logger.error(`Failed to get models: ${error.message}`);
      return [this.defaultModel]; // 返回默认模型
    }
  }
}
