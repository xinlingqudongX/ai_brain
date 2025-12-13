import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LlmService } from './llm.service';
import {
  SendMessageDto,
  CreateSessionDto,
  UpdateSessionDto,
  GetSessionsQueryDto,
  GetMessagesQueryDto,
  ChatMessageResponse,
  ChatSessionResponse,
  SendMessageResponse,
} from './dto/chat.dto';

@ApiTags('聊天管理')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('action/send-message')
  @ApiOperation({ summary: '发送消息' })
  @ApiResponse({ status: 200, description: '消息发送成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  async sendMessage(@Body() dto: SendMessageDto): Promise<SendMessageResponse> {
    return this.llmService.sendMessage(dto);
  }

  @Post('action/create-session')
  @ApiOperation({ summary: '创建新会话' })
  @ApiResponse({ status: 201, description: '会话创建成功' })
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body() dto: CreateSessionDto,
  ): Promise<ChatSessionResponse> {
    return this.llmService.createSession(dto);
  }

  @Post('action/get-sessions')
  @ApiOperation({ summary: '获取会话列表' })
  @ApiResponse({ status: 200, description: '获取会话列表成功' })
  async getSessions(@Body() query: GetSessionsQueryDto): Promise<{
    sessions: ChatSessionResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.llmService.getSessions(query);
  }

  @Post('action/get-session')
  @ApiOperation({ summary: '获取会话详情' })
  @ApiResponse({ status: 200, description: '获取会话详情成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  async getSession(
    @Body() body: { sessionId: string },
  ): Promise<ChatSessionResponse> {
    return this.llmService.getSession(body.sessionId);
  }

  @Post('action/update-session')
  @ApiOperation({ summary: '更新会话' })
  @ApiResponse({ status: 200, description: '会话更新成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  async updateSession(
    @Body() body: { sessionId: string } & UpdateSessionDto,
  ): Promise<ChatSessionResponse> {
    const { sessionId, ...dto } = body;
    return this.llmService.updateSession(sessionId, dto);
  }

  @Post('action/delete-session')
  @ApiOperation({ summary: '删除会话' })
  @ApiResponse({ status: 200, description: '会话删除成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  @HttpCode(HttpStatus.OK)
  async deleteSession(
    @Body() body: { sessionId: string },
  ): Promise<{ message: string }> {
    await this.llmService.deleteSession(body.sessionId);
    return { message: '会话删除成功' };
  }

  @Post('action/get-messages')
  @ApiOperation({ summary: '获取会话消息列表' })
  @ApiResponse({ status: 200, description: '获取消息列表成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  async getMessages(
    @Body() body: { sessionId: string } & GetMessagesQueryDto,
  ): Promise<{
    messages: ChatMessageResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { sessionId, ...query } = body;
    return this.llmService.getMessages(sessionId, query);
  }

  @Post('action/clear-messages')
  @ApiOperation({ summary: '清空会话消息' })
  @ApiResponse({ status: 200, description: '消息清空成功' })
  @ApiResponse({ status: 404, description: '会话不存在' })
  async clearMessages(
    @Body() body: { sessionId: string },
  ): Promise<{ message: string }> {
    await this.llmService.clearMessages(body.sessionId);
    return { message: '会话消息已清空' };
  }

  @Post('action/get-models')
  @ApiOperation({ summary: '获取可用模型列表' })
  @ApiResponse({ status: 200, description: '获取模型列表成功' })
  async getModels(): Promise<{ models: string[] }> {
    return {
      models: ['deepseek-chat', 'deepseek-coder', 'tongyi-qianwen'],
    };
  }
}
