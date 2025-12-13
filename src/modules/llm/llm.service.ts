import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AICore } from '../../ai/core/ai-core';
import { SessionEntity } from '../../entities/chat_session.entity';
import { ChatMessageEntity } from '../../entities/chat_message.entity';
import { 
  SendMessageDto, 
  CreateSessionDto, 
  UpdateSessionDto,
  GetSessionsQueryDto,
  GetMessagesQueryDto,
  ChatMessageResponse,
  ChatSessionResponse,
  SendMessageResponse
} from './dto/chat.dto';

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  public aiCore: AICore;

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
  ) {
    this.logger.log('LLM Service initialized with DeepSeek client and AI Core');
  }

  public async onModuleInit() {
    this.aiCore = new AICore();
  }

  /**
   * 发送消息并获取AI回复
   */
  async sendMessage(dto: SendMessageDto): Promise<SendMessageResponse> {
    const startTime = Date.now();

    // 检查会话是否存在
    const session = await this.sessionRepository.findOne({
      where: { id: dto.sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 保存用户消息
    const userMessage = this.messageRepository.create({
      session_id: dto.sessionId,
      role: 'user',
      content: dto.message,
    });
    await this.messageRepository.save(userMessage);

    try {
      // 获取会话历史
      const conversationHistory = await this.getConversationHistory(dto.sessionId);

      // 调用AI Core处理消息
      const aiResult = await this.aiCore.processMessage(dto.message, {
        sessionId: dto.sessionId,
        conversationHistory,
        systemPrompt: dto.systemPrompt,
      });

      // 保存AI回复
      const assistantMessage = this.messageRepository.create({
        session_id: dto.sessionId,
        role: 'assistant',
        content: aiResult.response,
        tool_calls: aiResult.toolResults,
        tokens: aiResult.tokensUsed,
        execution_time: aiResult.executionTime,
      });
      await this.messageRepository.save(assistantMessage);

      // 更新会话的更新时间
      session.updated_at = Date.now();
      await this.sessionRepository.save(session);

      const executionTime = Date.now() - startTime;

      return {
        message: this.formatMessageResponse(userMessage),
        response: this.formatMessageResponse(assistantMessage),
        executionTime,
        tokensUsed: aiResult.tokensUsed,
      };

    } catch (error) {
      this.logger.error(`AI处理消息失败: ${error.message}`, error.stack);
      
      // 保存错误回复
      const errorMessage = this.messageRepository.create({
        session_id: dto.sessionId,
        role: 'assistant',
        content: `抱歉，处理您的消息时出现了错误：${error.message}`,
        execution_time: Date.now() - startTime,
      });
      await this.messageRepository.save(errorMessage);

      const executionTime = Date.now() - startTime;

      return {
        message: this.formatMessageResponse(userMessage),
        response: this.formatMessageResponse(errorMessage),
        executionTime,
      };
    }
  }

  /**
   * 创建新会话
   */
  async createSession(dto: CreateSessionDto): Promise<ChatSessionResponse> {
    const now = Date.now();
    const session = this.sessionRepository.create({
      session_name: dto.sessionName,
      created_at: now,
      updated_at: now,
    });

    const savedSession = await this.sessionRepository.save(session);
    return this.formatSessionResponse(savedSession);
  }

  /**
   * 获取会话列表
   */
  async getSessions(query: GetSessionsQueryDto): Promise<{
    sessions: ChatSessionResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // 日期范围过滤
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      whereCondition.created_at = Between(start, end);
    }

    const [sessions, total] = await this.sessionRepository.findAndCount({
      where: whereCondition,
      order: { updated_at: 'DESC' },
      skip,
      take: limit,
    });

    // 获取每个会话的消息统计
    const sessionsWithStats = await Promise.all(
      sessions.map(async (session) => {
        const messageCount = await this.messageRepository.count({
          where: { session_id: session.id }
        });

        const lastMessage = await this.messageRepository.findOne({
          where: { session_id: session.id },
          order: { created_at: 'DESC' }
        });

        return {
          ...this.formatSessionResponse(session),
          messageCount,
          lastMessage: lastMessage?.content?.substring(0, 100) || '',
        };
      })
    );

    return {
      sessions: sessionsWithStats,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取会话详情
   */
  async getSession(sessionId: string): Promise<ChatSessionResponse> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    return this.formatSessionResponse(session);
  }

  /**
   * 更新会话
   */
  async updateSession(sessionId: string, dto: UpdateSessionDto): Promise<ChatSessionResponse> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    session.session_name = dto.sessionName;
    session.updated_at = Date.now();

    const updatedSession = await this.sessionRepository.save(session);
    return this.formatSessionResponse(updatedSession);
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 删除会话相关的所有消息
    await this.messageRepository.delete({ session_id: sessionId });
    
    // 删除会话
    await this.sessionRepository.delete({ id: sessionId });
  }

  /**
   * 获取会话消息列表
   */
  async getMessages(sessionId: string, query: GetMessagesQueryDto): Promise<{
    messages: ChatMessageResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    // 检查会话是否存在
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });

    return {
      messages: messages.map(msg => this.formatMessageResponse(msg)),
      total,
      page,
      limit,
    };
  }

  /**
   * 清空会话消息
   */
  async clearMessages(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    await this.messageRepository.delete({ session_id: sessionId });
  }

  /**
   * 获取会话的对话历史（用于AI上下文）
   */
  private async getConversationHistory(sessionId: string, limit: number = 20): Promise<any[]> {
    const messages = await this.messageRepository.find({
      where: { session_id: sessionId },
      order: { created_at: 'DESC' },
      take: limit,
    });

    // 转换为AI Core需要的格式，并按时间正序排列
    return messages
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  /**
   * 格式化消息响应
   */
  private formatMessageResponse(message: ChatMessageEntity): ChatMessageResponse {
    return {
      id: message.id,
      sessionId: message.session_id,
      role: message.role,
      content: message.content,
      toolCalls: message.tool_calls || [],
      tokens: message.tokens,
      executionTime: message.execution_time,
      createdAt: message.created_at,
    };
  }

  /**
   * 格式化会话响应
   */
  private formatSessionResponse(session: SessionEntity): ChatSessionResponse {
    return {
      id: session.id,
      sessionName: session.session_name,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }
}
