/**
 * HTTP适配器实现
 * 提供基于HTTP协议的通信能力
 */

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
    RetryOptions,
    HTTPError
} from '../types/protocol';

export class HTTPAdapter implements ProtocolAdapter {
    private isConnectedFlag = false;
    private connectionConfig: ConnectionConfig | null = null;
    private connectionInfo: ConnectionInfo;
    
    readonly protocolType = ProtocolType.HTTP;

    constructor() {
        this.connectionInfo = {
            url: '',
            protocol: ProtocolType.HTTP,
            connected: false
        };
    }

    async connect(config: ConnectionConfig): Promise<void> {
        this.connectionConfig = config;
        this.connectionInfo.url = config.url;
        this.connectionInfo.connected = true;
        this.connectionInfo.connectionTime = Date.now();
        this.isConnectedFlag = true;
        
        // HTTP是无状态协议，这里只是标记为已连接
        return Promise.resolve();
    }

    async disconnect(): Promise<void> {
        this.isConnectedFlag = false;
        this.connectionInfo.connected = false;
        this.connectionConfig = null;
        return Promise.resolve();
    }

    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        if (!this.isConnectedFlag) {
            throw new Error('HTTP adapter is not connected');
        }

        const startTime = Date.now();
        
        try {
            const fetchOptions: RequestInit = {
                method: request.method,
                headers: request.headers || {}
            };

            if (request.timeout) {
                fetchOptions.signal = AbortSignal.timeout(request.timeout);
            }

            if (request.body) {
                fetchOptions.body = typeof request.body === 'string' 
                    ? request.body 
                    : JSON.stringify(request.body);
                    
                if (!(fetchOptions.headers as Record<string, string>)['Content-Type']) {
                    (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
                }
            }

            const response = await fetch(request.url, fetchOptions);
            
            let data: any;
            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return {
                status: response.status,
                headers: this.headersToRecord(response.headers),
                data
            };

        } catch (error) {
            throw this.createHTTPError(error, startTime);
        }
    }

    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        if (!this.isConnectedFlag) {
            throw new Error('HTTP adapter is not connected');
        }

        const startTime = Date.now();
        
        try {
            // HTTP本身不支持流式传输，这里模拟流式响应
            const response = await this.send(request);
            
            // 将响应数据包装为流式格式
            if (typeof response.data === 'string') {
                // 如果是字符串，按行分割模拟流式传输
                const lines = response.data.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        yield {
                            type: StreamEventType.CHUNK,
                            data: line,
                            metadata: { startTime, timestamp: Date.now() }
                        };
                    }
                }
            } else {
                // 如果是JSON数据，直接作为单个块返回
                yield {
                    type: StreamEventType.CHUNK,
                    data: response.data,
                    metadata: { startTime, timestamp: Date.now() }
                };
            }

            yield {
                type: StreamEventType.COMPLETE,
                metadata: { startTime, endTime: Date.now() }
            };

        } catch (error) {
            yield {
                type: StreamEventType.ERROR,
                error: this.createErrorInfo(error),
                metadata: { startTime, endTime: Date.now() }
            };
        }
    }

    isConnected(): boolean {
        return this.isConnectedFlag;
    }

    getConnectionInfo(): ConnectionInfo {
        return { ...this.connectionInfo };
    }

    private createHTTPError(error: any, startTime: number): HTTPError {
        const errorMessage = error instanceof Error ? error.message : 'HTTP request failed';
        const httpError: HTTPError = new Error(errorMessage);
        
        httpError.name = 'HTTPError';
        httpError.timestamp = Date.now();
        
        if (error instanceof Error && error.stack) {
            httpError.stack = error.stack;
        }

        // 判断错误类型
        if (error.name === 'AbortError') {
            httpError.errorType = 'timeout';
        } else if (error.message?.includes('network')) {
            httpError.errorType = 'network';
        } else if (error.message?.includes('fetch')) {
            httpError.errorType = 'network';
        } else {
            httpError.errorType = 'http';
        }

        httpError.retryable = httpError.errorType === 'timeout' || httpError.errorType === 'network';
        
        return httpError;
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
        const httpError = error as HTTPError;
        
        return {
            code: httpError.errorType || 'HTTP_ERROR',
            message: errorMessage,
            details: error,
            timestamp: Date.now()
        };
    }
}