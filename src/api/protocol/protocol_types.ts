/**
 * 协议类型枚举
 */
export const ProtocolType = {
    SSE: 'SSE',
    WEBSOCKET: 'WEBSOCKET',
    HTTP: 'HTTP',
    MOCK: 'MOCK'
} as const;

export type ProtocolType = typeof ProtocolType[keyof typeof ProtocolType];

/**
 * 流事件类型
 */
export const StreamEventType = {
    CHUNK: 'chunk',
    COMPLETE: 'complete',
    ERROR: 'error',
    HEARTBEAT: 'heartbeat'
} as const;

export type StreamEventType = typeof StreamEventType[keyof typeof StreamEventType];

/**
 * 连接配置
 */
export interface ConnectionConfig {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
    retryOptions?: RetryOptions;
    heartbeatInterval?: number;
    maxReconnectAttempts?: number;
}

/**
 * 重试选项
 */
export interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
    retryCondition?: (error: Error) => boolean;
}

/**
 * 统一请求格式
 */
export interface UnifiedRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

/**
 * 统一响应格式
 */
export interface UnifiedResponse {
    status: number;
    headers: Record<string, string>;
    data: any;
}

/**
 * 流响应
 */
export interface StreamResponse<T = any> {
    type: StreamEventType;
    data?: T;
    error?: ErrorInfo;
    metadata?: StreamMetadata;
}

/**
 * 错误信息
 */
export interface ErrorInfo {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
}

/**
 * 流元数据
 */
export interface StreamMetadata {
    startTime: number;
    endTime?: number;
    timestamp?: number;
    size?: number;
    duration?: number;
}

/**
 * 连接信息
 */
export interface ConnectionInfo {
    url: string;
    protocol: ProtocolType;
    connected: boolean;
    connectionTime?: number;
    lastActivity?: number;
    reconnectAttempts?: number;
}

/**
 * 协议适配器接口
 */
export interface ProtocolAdapter {
    readonly protocolType: ProtocolType;
    
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(request: UnifiedRequest): Promise<UnifiedResponse>;
    sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse>;
    isConnected(): boolean;
    getConnectionInfo(): ConnectionInfo;
}

/**
 * AI平台类型枚举 (从主类型文件导入)
 */
export const AIPlatformType = {
    CHATGLM: "chatglm",
    TONGYI: "tongyi", 
    BAIDU: "baidu",
    DEEPSEEK: "deepseek",
    QWEN: "qwen",
} as const;

export type AIPlatformType = typeof AIPlatformType[keyof typeof AIPlatformType];