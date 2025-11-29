/**
 * WebSocket适配器实现
 * 提供基于WebSocket协议的通信能力
 */

/// <reference lib="dom" />

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
    StreamMetadata
} from '../types/protocol';

export class WebSocketAdapter implements ProtocolAdapter {
    private ws: WebSocket | null = null;
    private connectionConfig: ConnectionConfig | null = null;
    private connectionInfo: ConnectionInfo;
    private messageQueue: any[] = [];
    private isConnecting = false;
    
    readonly protocolType = ProtocolType.WEBSOCKET;

    constructor() {
        this.connectionInfo = {
            url: '',
            protocol: ProtocolType.WEBSOCKET,
            connected: false
        };
    }

    async connect(config: ConnectionConfig): Promise<void> {
        if (this.isConnecting || this.connectionInfo.connected) {
            return;
        }

        this.isConnecting = true;
        this.connectionConfig = config;
        this.connectionInfo.url = config.url;

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(config.url);
                
                this.ws.onopen = () => {
                    this.isConnecting = false;
                    this.connectionInfo.connected = true;
                    this.connectionInfo.connectionTime = Date.now();
                    resolve();
                };

                this.ws.onclose = () => {
                    this.isConnecting = false;
                    this.connectionInfo.connected = false;
                    this.ws = null;
                };

                this.ws.onerror = (error) => {
                    this.isConnecting = false;
                    this.connectionInfo.connected = false;
                    reject(new Error(`WebSocket connection failed: ${error.type}`));
                };

            } catch (error) {
                this.isConnecting = false;
                this.connectionInfo.connected = false;
                reject(error);
            }
        });
    }

    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.connectionInfo.connected = false;
        this.connectionConfig = null;
        this.messageQueue = [];
        
        return Promise.resolve();
    }

    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        if (!this.connectionInfo.connected || !this.ws) {
            throw new Error('WebSocket is not connected');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, request.timeout || 30000);

            if (this.ws) {
                const messageHandler = (event: MessageEvent) => {
                    clearTimeout(timeout);
                    this.ws!.onmessage = null;
                    
                    try {
                        const data = JSON.parse(event.data);
                        resolve({
                            status: 200,
                            headers: {},
                            data
                        });
                    } catch (error) {
                        resolve({
                            status: 200,
                            headers: {},
                            data: event.data
                        });
                    }
                };

                const errorHandler = (error: Event) => {
                    clearTimeout(timeout);
                    this.ws!.onmessage = null;
                    this.ws!.onerror = null;
                    reject(new Error(`WebSocket error: ${error.type}`));
                };

                this.ws.onmessage = messageHandler;
                this.ws.onerror = errorHandler;
            }

            // 发送请求
            const message = {
                type: 'request',
                method: request.method,
                url: request.url,
                headers: request.headers,
                body: request.body,
                timestamp: Date.now()
            };

            if (this.ws) {
                this.ws.send(JSON.stringify(message));
            }
        });
    }

    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        if (!this.connectionInfo.connected || !this.ws) {
            throw new Error('WebSocket is not connected');
        }

        const startTime = Date.now();
        
        try {
            // 发送流式请求
            const streamMessage = {
                type: 'stream',
                method: request.method,
                url: request.url,
                headers: request.headers,
                body: request.body,
                timestamp: startTime
            };

            this.ws.send(JSON.stringify(streamMessage));

            // 监听消息
            while (this.connectionInfo.connected && this.ws) {
                const message = await this.waitForMessage();
                
                if (message.type === 'stream_chunk') {
                    yield {
                        type: StreamEventType.CHUNK,
                        data: message.data,
                        metadata: { startTime, timestamp: Date.now() }
                    };
                } else if (message.type === 'stream_complete') {
                    yield {
                        type: StreamEventType.COMPLETE,
                        metadata: { startTime, endTime: Date.now() }
                    };
                    break;
                } else if (message.type === 'stream_error') {
                    yield {
                        type: StreamEventType.ERROR,
                        error: this.createErrorInfo(new Error(message.data)),
                        metadata: { startTime, endTime: Date.now() }
                    };
                    break;
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

    private waitForMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.ws) {
                reject(new Error('WebSocket is not connected'));
                return;
            }

            const timeout = setTimeout(() => {
                this.ws!.onmessage = null;
                this.ws!.onerror = null;
                reject(new Error('Message timeout'));
            }, 30000);

            const messageHandler = (event: MessageEvent) => {
                clearTimeout(timeout);
                this.ws!.onmessage = null;
                this.ws!.onerror = null;
                
                try {
                    const data = JSON.parse(event.data);
                    resolve(data);
                } catch (error) {
                    resolve({ type: 'text', data: event.data });
                }
            };

            const errorHandler = (error: Event) => {
                clearTimeout(timeout);
                this.ws!.onmessage = null;
                this.ws!.onerror = null;
                reject(new Error(`WebSocket error: ${error.type}`));
            };

            this.ws.onmessage = messageHandler;
            this.ws.onerror = errorHandler;
        });
    }

    isConnected(): boolean {
        return this.connectionInfo.connected && this.ws !== null;
    }

    getConnectionInfo(): ConnectionInfo {
        return { ...this.connectionInfo };
    }

    private createErrorInfo(error: any): ErrorInfo {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        return {
            code: 'WEBSOCKET_ERROR',
            message: errorMessage,
            details: error,
            timestamp: Date.now()
        };
    }
}