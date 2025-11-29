/**
 * Mock适配器实现
 * 用于测试和开发环境
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
    StreamMetadata
} from '../types/protocol';

export class MockAdapter implements ProtocolAdapter {
    private isConnectedFlag = false;
    private connectionConfig: ConnectionConfig | null = null;
    private connectionInfo: ConnectionInfo;
    private responseDelay = 100; // 模拟响应延迟
    
    readonly protocolType = ProtocolType.MOCK;

    constructor(responseDelay = 100) {
        this.responseDelay = responseDelay;
        this.connectionInfo = {
            url: 'mock://localhost',
            protocol: ProtocolType.MOCK,
            connected: false
        };
    }

    async connect(config: ConnectionConfig): Promise<void> {
        this.connectionConfig = config;
        this.connectionInfo.url = config.url;
        
        // 模拟连接延迟
        await this.delay(this.responseDelay);
        
        this.connectionInfo.connected = true;
        this.connectionInfo.connectionTime = Date.now();
        this.isConnectedFlag = true;
        
        return Promise.resolve();
    }

    async disconnect(): Promise<void> {
        // 模拟断开连接延迟
        await this.delay(this.responseDelay / 2);
        
        this.isConnectedFlag = false;
        this.connectionInfo.connected = false;
        this.connectionConfig = null;
        
        return Promise.resolve();
    }

    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        if (!this.isConnectedFlag) {
            throw new Error('Mock adapter is not connected');
        }

        const startTime = Date.now();
        
        try {
            // 模拟网络延迟
            await this.delay(this.responseDelay);
            
            // 生成模拟响应数据
            const mockData = this.generateMockResponse(request);
            
            return {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    'x-mock-response': 'true'
                },
                data: mockData
            };

        } catch (error) {
            throw new Error(`Mock request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        if (!this.isConnectedFlag) {
            throw new Error('Mock adapter is not connected');
        }

        const startTime = Date.now();
        const chunkCount = Math.floor(Math.random() * 5) + 3; // 3-7个数据块
        
        try {
            // 模拟流式响应
            for (let i = 0; i < chunkCount; i++) {
                // 模拟每个数据块之间的延迟
                await this.delay(this.responseDelay / 2);
                
                const chunkData = this.generateMockStreamChunk(request, i, chunkCount);
                
                yield {
                    type: StreamEventType.CHUNK,
                    data: chunkData,
                    metadata: { startTime, timestamp: Date.now() }
                };
            }

            // 完成响应
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

    private generateMockResponse(request: UnifiedRequest): any {
        const url = request.url.toLowerCase();
        
        // 根据URL路径生成不同的模拟响应
        if (url.includes('chat') || url.includes('conversation')) {
            return {
                id: `mock-chat-${Date.now()}`,
                message: "这是一个来自Mock适配器的模拟聊天响应",
                timestamp: new Date().toISOString()
            };
        }
        
        if (url.includes('model') || url.includes('config')) {
            return {
                models: [
                    { id: 'mock-model-1', name: 'Mock模型1' },
                    { id: 'mock-model-2', name: 'Mock模型2' }
                ],
                timestamp: new Date().toISOString()
            };
        }
        
        if (url.includes('user') || url.includes('profile')) {
            return {
                id: 'mock-user-123',
                name: 'Mock用户',
                email: 'mock@example.com',
                timestamp: new Date().toISOString()
            };
        }
        
        // 默认响应
        return {
            message: "这是一个来自Mock适配器的通用模拟响应",
            requestUrl: request.url,
            requestMethod: request.method,
            timestamp: new Date().toISOString()
        };
    }

    private generateMockStreamChunk(request: UnifiedRequest, chunkIndex: number, totalChunks: number): any {
        const messages = [
            "这是Mock适配器生成的第一段流式数据。",
            "Mock适配器正在模拟真实的流式响应。",
            "每个数据块之间都有适当的延迟。",
            "这有助于测试流式处理逻辑。",
            "Mock适配器提供了可控的测试环境。",
            "你可以调整响应延迟来模拟不同的网络条件。",
            "最后一段数据，流式响应即将完成。"
        ];
        
        const messageIndex = chunkIndex % messages.length;
        
        return {
            chunk: chunkIndex + 1,
            total: totalChunks,
            content: messages[messageIndex],
            progress: Math.round(((chunkIndex + 1) / totalChunks) * 100),
            timestamp: new Date().toISOString()
        };
    }

    private createErrorInfo(error: any): ErrorInfo {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        return {
            code: 'MOCK_ERROR',
            message: errorMessage,
            details: error,
            timestamp: Date.now()
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}