export interface ChatSession {
  id: string
  sessionName: string
  createdAt: number
  updatedAt: number
  messageCount?: number
  lastMessage?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: ToolCall[]
  tokens?: number
  executionTime?: number
  createdAt: Date
}

export interface ToolCall {
  tool: string
  parameters: Record<string, any>
  result: any
  success: boolean
  error?: string
}

export interface SendMessageRequest {
  sessionId: string
  message: string
  systemPrompt?: string
}

export interface SendMessageResponse {
  message: ChatMessage
  response: ChatMessage
  executionTime: number
  tokensUsed?: number
}

export interface CreateSessionRequest {
  sessionName: string
}

export interface UpdateSessionRequest {
  sessionName: string
}

export interface GetSessionsRequest {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface GetSessionsResponse {
  sessions: ChatSession[]
  total: number
  page: number
  limit: number
}

export interface GetMessagesRequest {
  page?: number
  limit?: number
}

export interface GetMessagesResponse {
  messages: ChatMessage[]
  total: number
  page: number
  limit: number
}