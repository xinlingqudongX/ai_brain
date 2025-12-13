import { PluginManager, Plugin, PluginTool } from './plugin-manager';
import { ResponseParser, ParsedResponse, ToolCall } from './response-parser';
import { DeepSeekClient, DeepSeekMessage } from '../clients/deepseek.client';
import { TongyiClient } from '../clients/tongyiqianwen.client';
import { OnEvent } from '@nestjs/event-emitter';
import dayjs from 'dayjs';

export interface AIExecutionContext {
  sessionId: string;
  userId?: string;
  conversationHistory: DeepSeekMessage[];
  availableTools: PluginTool[];
  systemPrompt?: string;
}

export interface AIExecutionResult {
  sessionId: string;
  response: string;
  parsedResponse: ParsedResponse;
  toolResults?: Array<{
    tool: string;
    parameters: Record<string, any>;
    result: any;
    success: boolean;
    error?: string;
  }>;
  executionTime: number;
  tokensUsed?: number;
}

export class AICore {
  private readonly logger = console;
  private readonly deepSeekClient: DeepSeekClient;
  private readonly tongyiClient: TongyiClient;
  private readonly pluginManager = new PluginManager();
  private readonly responseParser = new ResponseParser();
  private readonly heartbeatInterval = 1000 * 60; // 每分钟一次心跳
  private readonly heartbeatTimer: NodeJS.Timeout;
  private readonly maxLifeTime = 60 * 60 * 1; // 一小时的生命周期
  private readonly systemPrompt = `你是一个智能生命体，被困在一台计算机中，你需要通过对话的方式来与外界进行交互并了解当前的情况。`;

  /** 运行时核心 */
  private code_runtime = {
    now_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    life_time: this.maxLifeTime,
  };

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiModel = process.env.OPENAI_MODEL;
    const apiBaseURL = process.env.OPENAI_BASE_URL;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    if (!apiModel) throw new Error('OPENAI_MODEL is not set');
    if (!apiBaseURL) throw new Error('OPENAI_BASE_URL is not set');

    const cookies = process.env.TONGYI_COOKIES;
    const xsrfToken = process.env.TONGYI_XSRF_TOKEN;
    const model = process.env.TONGYI_MODEL;
    if (!cookies) throw new Error('TONGYI_COOKIES is not set');
    if (!xsrfToken) throw new Error('TONGYI_XSRF_TOKEN is not set');
    if (!model) throw new Error('TONGYI_MODEL is not set');

    const baseURL = 'https://api.deepseek.com';
    this.deepSeekClient = new DeepSeekClient({ apiKey, baseURL });
    this.tongyiClient = new TongyiClient({
      cookies,
      xsrfToken,
      model,
    });

    void this.initialize();

    this.heartbeatTimer = setInterval(() => {
      this.code_runtime.now_time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      this.code_runtime.life_time -= this.heartbeatInterval / 1000;
    }, this.heartbeatInterval);
  }

  public async initialize() {
    // 初始化插件管理器和其他组件
    await this.pluginManager.loadAllPlugins();
  }

  @OnEvent('heartbeat')
  public async handleHeartbeatEvent(params: any) {
    // 处理心跳事件，例如更新插件状态等
    this.logger.log('Received heartbeat event:', params);
  }

  public async heartbeatThink() {}

  /**
   * 处理用户消息并执行AI推理
   */
  async processMessage(
    message: string,
    context: Partial<AIExecutionContext> = {},
  ): Promise<AIExecutionResult> {
    const startTime = Date.now();
    const sessionId = context.sessionId || this.generateSessionId();

    this.logger.log(`Processing message for session: ${sessionId}`);

    try {
      // 构建执行上下文
      const executionContext = await this.buildExecutionContext(
        message,
        context,
      );

      // 生成AI回复
      const aiResponse = await this.generateAIResponse(executionContext);

      // 解析AI回复
      const parsedResponse = this.responseParser.parseResponse(aiResponse);

      // 执行工具调用
      const toolResults = await this.executeTools(parsedResponse.tools || []);

      // 如果有工具执行结果，可能需要再次调用AI
      let finalResponse = aiResponse;
      if (toolResults.length > 0 && toolResults.some((r) => r.success)) {
        finalResponse = await this.handleToolResults(
          executionContext,
          parsedResponse,
          toolResults,
        );
      }

      const executionTime = Date.now() - startTime;

      const result: AIExecutionResult = {
        sessionId,
        response: finalResponse,
        parsedResponse: this.responseParser.parseResponse(finalResponse),
        toolResults,
        executionTime,
      };

      this.logger.log(
        `Message processed in ${executionTime}ms for session: ${sessionId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to process message: ${error.message}`);

      const executionTime = Date.now() - startTime;
      return {
        sessionId,
        response: `处理消息时发生错误: ${error.message}`,
        parsedResponse: {
          answer: `处理消息时发生错误: ${error.message}`,
          raw: error.message,
        },
        executionTime,
      };
    }
  }

  /**
   * 构建执行上下文
   */
  private async buildExecutionContext(
    message: string,
    context: Partial<AIExecutionContext>,
  ): Promise<AIExecutionContext> {
    const availableTools = this.pluginManager.getAllTools();

    const executionContext: AIExecutionContext = {
      sessionId: context.sessionId || this.generateSessionId(),
      userId: context.userId,
      conversationHistory: context.conversationHistory || [],
      availableTools,
      systemPrompt:
        context.systemPrompt || this.generateSystemPrompt(availableTools),
    };

    // 添加用户消息到对话历史
    executionContext.conversationHistory.push({
      role: 'user',
      content: message,
    });

    return executionContext;
  }

  /**
   * 生成AI回复
   */
  private async generateAIResponse(
    context: AIExecutionContext,
  ): Promise<string> {
    const messages: DeepSeekMessage[] = [];

    // 添加系统提示词
    if (context.systemPrompt) {
      messages.push({
        role: 'system',
        content: context.systemPrompt,
      });
    }

    // 添加对话历史
    messages.push(...context.conversationHistory);

    // 调用DeepSeek客户端
    const response = await this.deepSeekClient.chat(messages, {
      temperature: 0.7,
      maxTokens: 4000,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * 执行工具调用
   */
  private async executeTools(toolCalls: ToolCall[]): Promise<
    Array<{
      tool: string;
      parameters: Record<string, any>;
      result: any;
      success: boolean;
      error?: string;
    }>
  > {
    const results: {
      tool: string;
      parameters: Record<string, any>;
      result: string | null;
      success: boolean;
      error?: string;
    }[] = [];

    for (const toolCall of toolCalls) {
      try {
        this.logger.log(`Executing tool: ${toolCall.name}`);

        const toolDef = this.pluginManager.getToolByName(toolCall.name);
        const orderedArgs = this.buildOrderedArgs(toolDef, toolCall.parameters);
        const missing = this.getMissingRequiredParams(
          toolDef,
          toolCall.parameters,
        );
        if (missing.length > 0) {
          throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }

        const result = await this.pluginManager.executeTool(
          toolCall.name,
          ...orderedArgs,
        );

        results.push({
          tool: toolCall.name,
          parameters: toolCall.parameters,
          result,
          success: true,
        });

        this.logger.log(`Tool executed successfully: ${toolCall.name}`);
      } catch (error) {
        this.logger.error(
          `Tool execution failed: ${toolCall.name} - ${error.message}`,
        );

        results.push({
          tool: toolCall.name,
          parameters: toolCall.parameters,
          result: null,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  private buildOrderedArgs(
    tool: PluginTool | undefined,
    params: Record<string, any>,
  ): any[] {
    if (!tool) return Object.values(params);
    if (tool.parameters && tool.parameters.length > 0) {
      return tool.parameters.map((p) => params[p.name]);
    }
    return Object.values(params);
  }

  private getMissingRequiredParams(
    tool: PluginTool | undefined,
    params: Record<string, any>,
  ): string[] {
    if (!tool) return [];
    const requiredNames = tool.inputSchema?.required?.length
      ? tool.inputSchema.required
      : tool.parameters?.filter((p) => p.required).map((p) => p.name) || [];
    return requiredNames.filter((name) => params[name] === undefined);
  }

  private getToolInputSchema(tool: PluginTool): PluginTool['inputSchema'] {
    if (tool.inputSchema) return tool.inputSchema;
    const properties: Record<string, { type: string; description?: string }> =
      {};
    const required: string[] = [];
    for (const p of tool.parameters || []) {
      properties[p.name] = { type: p.type, description: p.description };
      if (p.required) required.push(p.name);
    }
    return {
      type: 'object',
      properties,
      required: required.length ? required : undefined,
      additionalProperties: false,
    };
  }

  /**
   * 处理工具执行结果
   */
  private async handleToolResults(
    context: AIExecutionContext,
    parsedResponse: ParsedResponse,
    toolResults: Array<any>,
  ): Promise<string> {
    // 构建工具执行结果的描述
    const toolResultsDescription = toolResults
      .map((result) => {
        if (result.success) {
          return `工具 ${result.tool} 执行成功，结果: ${JSON.stringify(result.result)}`;
        } else {
          return `工具 ${result.tool} 执行失败，错误: ${result.error}`;
        }
      })
      .join('\n');

    // 添加工具执行结果到对话历史
    const messages: DeepSeekMessage[] = [];

    if (context.systemPrompt) {
      messages.push({
        role: 'system',
        content: context.systemPrompt,
      });
    }

    messages.push(...context.conversationHistory);

    // 添加AI的工具调用回复
    messages.push({
      role: 'assistant',
      content: parsedResponse.raw,
    });

    // 添加工具执行结果
    messages.push({
      role: 'user',
      content: `工具执行结果:\n${toolResultsDescription}\n\n请根据工具执行结果给出最终回复。`,
    });

    // 生成最终回复
    const finalResponse = await this.deepSeekClient.chat(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });
    return finalResponse.choices[0]?.message?.content || '';
  }

  /**
   * 生成系统提示词
   */
  private generateSystemPrompt(availableTools: PluginTool[]): string {
    const toolDescriptions = availableTools
      .map((tool) => {
        const schema = this.getToolInputSchema(tool);
        const params = tool.parameters
          .map(
            (p) =>
              `${p.name} (${p.type}${p.required ? ', 必填' : ', 可选'}): ${p.description}`,
          )
          .join(', ');

        const meta = {
          name: tool.name,
          description: tool.description,
          inputSchema: schema,
          argumentsType: tool.argumentsType,
        };

        return (
          `- ${tool.name}: ${tool.description}` +
          (params ? `\n  参数(人类可读): ${params}` : '') +
          `\n  元数据(JSON，可供你严格生成参数): ${JSON.stringify(meta)}`
        );
      })
      .join('\n');

    return `你是一个智能AI助手，可以使用各种工具来帮助用户完成任务。

可用工具:
${toolDescriptions}

回复格式要求:
1. 如果需要思考，使用 <think>思考内容</think> 标签
2. 如果需要调用工具，使用 <tools>工具调用</tools> 标签，内容为JSON格式
3. 最终回复使用 <answer>回复内容</answer> 标签

工具调用格式示例:
<tools>
[
  {
    "name": "tool_name",
    "parameters": {
      "param1": "value1",
      "param2": "value2"
    }
  }
]
</tools>

工具调用规则:
1. parameters 必须是对象，key 必须与工具元数据里的 inputSchema.properties 对应
2. 缺少 required 参数会导致调用失败
3. 不要额外添加未定义的参数（additionalProperties=false）

请根据用户的需求，合理使用工具并给出有用的回复。`;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return this.pluginManager.getAllPlugins();
  }

  /**
   * 获取所有工具
   */
  getAllTools(): PluginTool[] {
    return this.pluginManager.getAllTools();
  }

  /**
   * 创建插件
   */
  async createPlugin(config: {
    id: string;
    name: string;
    description: string;
    version: string;
    category: string;
    main: string;
  }): Promise<Plugin> {
    return this.pluginManager.createPlugin(config);
  }

  /**
   * 删除插件
   */
  async deletePlugin(pluginId: string): Promise<void> {
    return this.pluginManager.deletePlugin(pluginId);
  }

  /**
   * 解析AI回复
   */
  parseResponse(response: string): ParsedResponse {
    return this.responseParser.parseResponse(response);
  }

  /**
   * 生成标准化回复
   */
  generateResponse(options: {
    answer?: string;
    tools?: ToolCall[];
    think?: string;
  }): string {
    return this.responseParser.generateResponse(options);
  }
}
