/**
 * 基于fetch-event-stream的SSE适配器实现
 * 使用fetch-event-stream库处理SSE流
 */

import { stream, events } from 'fetch-event-stream';
import {
    ProtocolAdapter,
    ProtocolType,
    ConnectionConfig,
    UnifiedRequest,
    UnifiedResponse,
    StreamResponse,
    StreamEventType,
    ConnectionInfo,
    ErrorInfo,
    StreamMetadata,
    RetryOptions
} from './protocol_types';

export class SSEAdapter implements ProtocolAdapter {
    private controller: AbortController | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private connectionInfo: ConnectionInfo;
    private isCurrentlyConnected = false;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private lastActivity: number = Date.now();
    
    readonly protocolType = ProtocolType.SSE;

    constructor() {
        this.connectionInfo = {
            url: '',
            protocol: ProtocolType.SSE,
            connected: false
        };
    }

    async connect(config: ConnectionConfig): Promise<void> {
        this.connectionInfo.url = config.url;
        this.maxReconnectAttempts = config.maxReconnectAttempts || 3;
        
        return new Promise((resolve, reject) => {
            this.setupConnection(config, resolve, reject);
        });
    }

    private async setupConnection(
        config: ConnectionConfig, 
        resolve: () => void, 
        reject: (error: Error) => void
    ): Promise<void> {
        try {
            // 创建AbortController用于连接管理
            this.controller = new AbortController();
            
            // 设置请求头
            const headers = {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                ...config.headers
            };

            // 使用fetch API建立连接
            const response = await fetch(config.url, {
                method: 'GET',
                headers,
                signal: this.controller.signal,
                // 重要：确保使用流式响应
                // @ts-ignore - 某些环境可能需要特定的fetch选项
                ...(typeof Request !== 'undefined' && {
                    // 现代fetch API选项
                    keepalive: true,
                    mode: 'cors',
                    credentials: 'include'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 验证响应类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('text/event-stream')) {
                console.warn('Response content-type is not text/event-stream:', contentType);
            }

            // 获取流读取器
            const body = response.body;
            if (!body) {
                throw new Error('No response body available');
            }

            this.reader = body.getReader();
            this.isCurrentlyConnected = true;
            this.connectionInfo.connected = true;
            this.connectionInfo.connectionTime = Date.now();
            this.connectionInfo.lastActivity = Date.now();
            this.reconnectAttempts = 0;

            // 启动心跳机制
            this.startHeartbeat(config.heartbeatInterval || 30000);

            resolve();
            
        } catch (error) {
            this.handleConnectionError(error, config, resolve, reject);
        }
    }

    private handleConnectionError(
        error: any,
        config: ConnectionConfig,
        resolve: () => void,
        reject: (error: Error) => void
    ): void {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        const errorInfo = this.createErrorInfo(error);

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.calculateReconnectDelay(config.retryOptions);
            
            console.log(`Connection failed. Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
            
            setTimeout(() => {
                this.setupConnection(config, resolve, reject);
            }, delay);
        } else {
            this.isCurrentlyConnected = false;
            this.connectionInfo.connected = false;
            reject(new Error(`Max reconnection attempts reached: ${errorMessage}`));
        }
    }

    private calculateReconnectDelay(retryOptions?: RetryOptions): number {
        const baseDelay = retryOptions?.delay || 1000;
        const backoff = retryOptions?.backoff || 'exponential';
        
        if (backoff === 'exponential') {
            return Math.min(baseDelay * Math.pow(2, this.reconnectAttempts), 30000);
        }
        
        return baseDelay;
    }

    private startHeartbeat(interval: number): void {
        this.stopHeartbeat();
        
        this.heartbeatTimer = setInterval(() => {
            if (this.isCurrentlyConnected) {
                // 检查连接状态
                if (Date.now() - this.lastActivity > interval * 3) {
                    console.warn('Connection appears to be stale, considering reconnection...');
                    this.isCurrentlyConnected = false;
                    this.connectionInfo.connected = false;
                }
            }
        }, interval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        const startTime = Date.now();
        
        try {
            // 构建请求选项
            const requestInit: RequestInit = {
                method: request.method,
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                    ...request.headers
                },
                body: JSON.stringify(request.body)
            };

            // 如果有控制器，添加信号
            if (this.controller) {
                requestInit.signal = this.controller.signal;
            }

            // 使用fetch-event-stream库处理SSE流
            const sseStream = await stream(request.url, requestInit);

            // 处理SSE事件流
            for await (const event of sseStream) {
                this.lastActivity = Date.now();
                this.connectionInfo.lastActivity = this.lastActivity;

                // 检查是否为结束标记
                if (event.data === '[DONE]') {
                    yield {
                        type: StreamEventType.COMPLETE,
                        metadata: { startTime, endTime: Date.now() }
                    };
                    break;
                }

                try {
                    // 尝试解析JSON数据
                    const parsedData = JSON.parse(event.data || '{}');
                    yield {
                        type: StreamEventType.CHUNK,
                        data: parsedData,
                        metadata: { startTime, timestamp: Date.now() }
                    };
                } catch (parseError) {
                    // 如果不是JSON格式，作为原始数据返回
                    yield {
                        type: StreamEventType.CHUNK,
                        data: event.data || '',
                        metadata: { startTime, timestamp: Date.now() }
                    };
                }
            }
            
        } catch (error) {
            yield {
                type: StreamEventType.ERROR,
                error: this.createErrorInfo(error),
                metadata: { startTime, endTime: Date.now() }
            };
        }
    }



    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        try {
            const fetchOptions: RequestInit = {
                method: request.method,
                headers: request.headers || {}
            };

            if (request.body) {
                fetchOptions.body = JSON.stringify(request.body);
            }

            if (this.controller) {
                fetchOptions.signal = this.controller.signal;
            }

            const response = await fetch(request.url, fetchOptions);

            const data = await response.json();
            
            return {
                status: response.status,
                headers: this.headersToRecord(response.headers),
                data
            };
        } catch (error) {
            throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async disconnect(): Promise<void> {
        this.stopHeartbeat();
        this.isCurrentlyConnected = false;
        this.connectionInfo.connected = false;

        // 释放流读取器
        if (this.reader) {
            try {
                await this.reader.cancel();
                this.reader.releaseLock();
            } catch (error) {
                console.warn('Error releasing reader:', error);
            }
            this.reader = null;
        }

        // 中止fetch请求
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }

        return Promise.resolve();
    }

    isConnected(): boolean {
        return this.isCurrentlyConnected;
    }

    getConnectionInfo(): ConnectionInfo {
        return {
            ...this.connectionInfo,
            reconnectAttempts: this.reconnectAttempts,
            lastActivity: this.lastActivity
        };
    }

    private headersToRecord(headers: Headers): Record<string, string> {
        const record: Record<string, string> = {};
        headers.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }

    private createErrorInfo(error: any): ErrorInfo {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = this.getErrorCode(errorMessage);
        
        return {
            code: errorCode,
            message: errorMessage,
            details: error,
            timestamp: Date.now()
        };
    }

    private getErrorCode(errorMessage: string): string {
        if (errorMessage.includes('network')) return 'NETWORK_ERROR';
        if (errorMessage.includes('timeout')) return 'TIMEOUT_ERROR';
        if (errorMessage.includes('HTTP')) return 'HTTP_ERROR';
        if (errorMessage.includes('abort')) return 'ABORT_ERROR';
        return 'UNKNOWN_ERROR';
    }
}