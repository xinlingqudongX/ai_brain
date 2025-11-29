/**
 * Mock适配器实现
 * 用于开发和测试，提供模拟的AI响应数据
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
} from './protocol_types';

export class MockAdapter implements ProtocolAdapter {
    private connectionInfo: ConnectionInfo;
    private connected = false;
    private mockData: any[] = [];
    private responseDelay = 100; // 默认延迟100ms
    
    readonly protocolType = ProtocolType.MOCK;

    constructor(mockData?: any[], responseDelay?: number) {
        this.connectionInfo = {
            url: 'mock://localhost',
            protocol: ProtocolType.MOCK,
            connected: false
        };
        
        if (mockData) {
            this.mockData = mockData;
        } else {
            // 默认的模拟数据
            this.mockData = this.generateDefaultMockData();
        }
        
        if (responseDelay !== undefined) {
            this.responseDelay = responseDelay;
        }
    }

    async connect(config: ConnectionConfig): Promise<void> {
        this.connectionInfo.url = config.url || 'mock://localhost';
        this.connectionInfo.connected = true;
        this.connected = true;
        this.connectionInfo.connectionTime = Date.now();
        
        // 模拟连接延迟
        await this.delay(50);
        return Promise.resolve();
    }

    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        const startTime = Date.now();
        
        try {
            // 模拟网络延迟
            await this.delay(this.responseDelay);
            
            // 根据请求内容生成模拟响应
            const mockResponses = this.generateMockStreamResponse(request);
            
            for (const response of mockResponses) {
                yield {
                    type: StreamEventType.CHUNK,
                    data: response,
                    metadata: { startTime, timestamp: Date.now() }
                };
                
                // 模拟流式响应间隔
                await this.delay(50 + Math.random() * 100);
            }
            
            // 发送完成信号
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

    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        // 模拟网络延迟
        await this.delay(this.responseDelay);
        
        const mockData = this.generateMockResponse(request);
        
        return {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'x-mock-response': 'true'
            },
            data: mockData
        };
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        this.connectionInfo.connected = false;
        
        // 模拟断开连接延迟
        await this.delay(10);
        return Promise.resolve();
    }

    isConnected(): boolean {
        return this.connected;
    }

    getConnectionInfo(): ConnectionInfo {
        return {
            ...this.connectionInfo,
            lastActivity: Date.now()
        };
    }

    // 设置模拟数据
    setMockData(mockData: any[]): void {
        this.mockData = mockData;
    }

    // 设置响应延迟
    setResponseDelay(delay: number): void {
        this.responseDelay = delay;
    }

    // 生成默认的模拟数据
    private generateDefaultMockData(): any[] {
        return [
            {
                id: 'mock-1',
                content: '你好！我是一个AI助手。',
                role: 'assistant'
            },
            {
                id: 'mock-2',
                content: '我可以帮助你回答问题和完成任务。',
                role: 'assistant'
            },
            {
                id: 'mock-3',
                content: '请告诉我你需要什么帮助。',
                role: 'assistant'
            }
        ];
    }

    // 生成流式响应
    private generateMockStreamResponse(request: UnifiedRequest): any[] {
        const userMessage = request.body?.messages?.[request.body.messages.length - 1]?.content || 'Hello';
        
        // 基于用户消息生成不同的响应
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('你好')) {
            return [
                { content: '你好！', delta: { content: '你' } },
                { content: '你好！', delta: { content: '好' } },
                { content: '你好！', delta: { content: '！' } },
                { content: '你好！', delta: { content: '' }, finish_reason: 'stop' }
            ];
        }
        
        if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('帮助')) {
            return [
                { content: '我很乐意帮助你！', delta: { content: '我' } },
                { content: '我很乐意帮助你！', delta: { content: '很' } },
                { content: '我很乐意帮助你！', delta: { content: '乐' } },
                { content: '我很乐意帮助你！', delta: { content: '意' } },
                { content: '我很乐意帮助你！', delta: { content: '帮' } },
                { content: '我很乐意帮助你！', delta: { content: '助' } },
                { content: '我很乐意帮助你！', delta: { content: '你' } },
                { content: '我很乐意帮助你！', delta: { content: '！' } },
                { content: '我很乐意帮助你！', delta: { content: '' }, finish_reason: 'stop' }
            ];
        }
        
        // 默认响应
        return [
            { content: '这是模拟的流式响应。', delta: { content: '这' } },
            { content: '这是模拟的流式响应。', delta: { content: '是' } },
            { content: '这是模拟的流式响应。', delta: { content: '模' } },
            { content: '这是模拟的流式响应。', delta: { content: '拟' } },
            { content: '这是模拟的流式响应。', delta: { content: '的' } },
            { content: '这是模拟的流式响应。', delta: { content: '流' } },
            { content: '这是模拟的流式响应。', delta: { content: '式' } },
            { content: '这是模拟的流式响应。', delta: { content: '响' } },
            { content: '这是模拟的流式响应。', delta: { content: '应' } },
            { content: '这是模拟的流式响应。', delta: { content: '。' } },
            { content: '这是模拟的流式响应。', delta: { content: '' }, finish_reason: 'stop' }
        ];
    }

    // 生成普通响应
    private generateMockResponse(request: UnifiedRequest): any {
        const userMessage = request.body?.messages?.[request.body.messages.length - 1]?.content || 'Hello';
        
        return {
            id: `mock-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'mock-model',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: `这是模拟响应，你的消息是：${userMessage}`
                },
                finish_reason: 'stop'
            }],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
            }
        };
    }

    // 延迟函数
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 创建错误信息
    private createErrorInfo(error: any): ErrorInfo {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        return {
            code: 'MOCK_ERROR',
            message: errorMessage,
            details: error,
            timestamp: Date.now()
        };
    }
}