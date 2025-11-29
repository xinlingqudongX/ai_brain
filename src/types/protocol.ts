/**
 * 协议适配器核心类型定义
 */

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
 * 适配器配置
 */
export interface AdapterConfig {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
    retryConfig?: RetryConfig;
    authConfig?: AuthConfig;
    poolConfig?: ConnectionPoolConfig;
    messageConfig?: MessageConfig;
    reconnectConfig?: ReconnectConfig;
}

/**
 * 重试配置
 */
export interface RetryConfig {
    maxAttempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
    retryCondition?: (error: Error) => boolean;
}

/**
 * 认证配置
 */
export interface AuthConfig {
    type: 'none' | 'basic' | 'bearer' | 'custom' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    customAuth?: (config: AdapterConfig) => Promise<Record<string, string>>;
}

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
    minConnections: number;
    maxConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
    connectionLifetime: number;
    validationInterval: number;
}

/**
 * 消息配置
 */
export interface MessageConfig {
    compression: boolean;
    compressionThreshold: number;
    fragmentation: boolean;
    fragmentSize: number;
    acknowledgment: boolean;
    acknowledgmentTimeout: number;
    retry: boolean;
    retryAttempts: number;
    retryDelay: number;
}

/**
 * 重连配置
 */
export interface ReconnectConfig {
    enabled: boolean;
    interval: number;
    maxAttempts: number;
    backoffMultiplier: number;
    maxInterval: number;
    reconnectCondition?: (error: Error, config: AdapterConfig) => boolean;
}

/**
 * 连接池选项
 */
export interface ConnectionPoolOptions {
    maxConnections?: number;
    connectionTimeout?: number;
    idleTimeout?: number;
    healthCheckInterval?: number;
}

/**
 * 适配器能力
 */
export interface AdapterCapability {
    streaming: boolean;
    compression: boolean;
    authentication: boolean;
    multiplexing: boolean;
    keepAlive: boolean;
}

/**
 * 连接状态
 */
export enum ConnectionState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    RECONNECTING = 'RECONNECTING',
    DISCONNECTING = 'DISCONNECTING',
    ERROR = 'ERROR'
}

/**
 * 消息数据
 */
export interface MessageData {
    id?: string;
    type: string;
    data: any;
    timestamp: number;
    metadata?: Record<string, any>;
}

/**
 * WebSocket错误
 */
export interface WebSocketError extends Error {
    code?: number;
    retryable?: boolean;
    connectionId?: string;
    messageId?: string;
    errorType?: 'timeout' | 'network' | 'connection' | 'authentication' | 'message' | 'protocol';
}

/**
 * HTTP错误
 */
export interface HTTPError extends Error {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    retryable?: boolean;
    requestId?: string;
    timestamp?: number;
    errorType?: 'timeout' | 'network' | 'http' | 'authentication' | 'rate_limit';
}