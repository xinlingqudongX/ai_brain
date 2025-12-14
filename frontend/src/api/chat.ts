import axios from 'axios';
import type {
  ChatSession,
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
  GetSessionsRequest,
  GetSessionsResponse,
  GetMessagesRequest,
  GetMessagesResponse,
} from '../types/chat';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  // 发送消息
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post('/llm/action/send-message', data);
    return response.data;
  },

  // 创建会话
  async createSession(data: CreateSessionRequest): Promise<ChatSession> {
    const response = await api.post('/llm/action/create-session', data);
    return response.data;
  },

  // 获取会话列表
  async getSessions(
    params: GetSessionsRequest = {},
  ): Promise<GetSessionsResponse> {
    const response = await api.post('/llm/action/get-sessions', {
      page: 1,
      limit: 100,
      ...params,
    });
    return response.data;
  },

  // 获取会话详情
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.post('/llm/action/get-session', { sessionId });
    return response.data;
  },

  // 更新会话
  async updateSession(
    sessionId: string,
    data: UpdateSessionRequest,
  ): Promise<ChatSession> {
    const response = await api.post('/llm/action/update-session', {
      sessionId,
      ...data,
    });
    return response.data;
  },

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    await api.post('/llm/action/delete-session', { sessionId });
  },

  // 获取消息列表
  async getMessages(
    sessionId: string,
    params: GetMessagesRequest = {},
  ): Promise<GetMessagesResponse> {
    const response = await api.post('/llm/action/get-messages', {
      sessionId,
      page: 1,
      limit: 100,
      ...params,
    });
    return response.data;
  },

  // 清空会话消息
  async clearMessages(sessionId: string): Promise<void> {
    await api.post('/llm/action/clear-messages', { sessionId });
  },

  // 获取可用模型
  async getModels(): Promise<{ models: string[] }> {
    const response = await api.post('/llm/action/get-models');
    return response.data;
  },
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(
      'API Request:',
      config.method?.toUpperCase(),
      config.url,
      config.data,
    );
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(
      'API Response:',
      response.status,
      response.config.url,
      response.data,
    );
    return response;
  },
  (error) => {
    console.error(
      'API Response Error:',
      error.response?.status,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);
