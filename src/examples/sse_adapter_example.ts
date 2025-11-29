/**
 * SSE适配器使用示例
 * 展示如何使用基于fetch-event-stream的SSEAdapter
 */

import { SSEAdapter, ProtocolAdapterFactory, ConnectionConfig, UnifiedRequest, StreamEventType } from '../api/protocol';

async function demonstrateSSEAdapter() {
    console.log('=== SSE适配器使用示例 ===\n');

    // 方式1：直接使用SSEAdapter
    console.log('1. 直接使用SSEAdapter:');
    const adapter1 = new SSEAdapter();
    
    const config1: ConnectionConfig = {
        url: 'https://api.example.com/sse-endpoint',
        headers: {
            'Authorization': 'Bearer your-token',
            'Custom-Header': 'custom-value'
        },
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000
    };

    try {
        await adapter1.connect(config1);
        console.log('✅ SSEAdapter连接成功');
        console.log('连接信息:', adapter1.getConnectionInfo());
    } catch (error) {
        console.error('❌ SSEAdapter连接失败:', error);
    }

    // 方式2：使用工厂模式创建
    console.log('\n2. 使用ProtocolAdapterFactory创建:');
    const adapter2 = ProtocolAdapterFactory.createAdapter('SSE');
    console.log('✅ 通过工厂创建SSEAdapter成功');

    // 方式3：模拟流式请求
    console.log('\n3. 模拟流式请求:');
    await simulateStreamRequest(adapter2);

    // 清理
    await adapter1.disconnect();
    await adapter2.disconnect();
    console.log('\n✅ 所有适配器已断开连接');
}

async function simulateStreamRequest(adapter: any) {
    const request: UnifiedRequest = {
        url: 'https://api.example.com/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-token'
        },
        body: {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: '你好，请介绍一下SSE的工作原理' }],
            stream: true
        }
    };

    console.log('发送流式请求...');
    
    try {
        for await (const response of adapter.sendStream(request)) {
            switch (response.type) {
                case StreamEventType.CHUNK:
                    console.log('📦 收到数据块:', response.data);
                    break;
                case StreamEventType.COMPLETE:
                    console.log('✅ 流式响应完成');
                    console.log('元数据:', response.metadata);
                    break;
                case StreamEventType.ERROR:
                    console.error('❌ 流式响应错误:', response.error);
                    break;
                case StreamEventType.HEARTBEAT:
                    console.log('💓 心跳信号');
                    break;
            }
        }
    } catch (error) {
        console.error('流式请求失败:', error);
    }
}

// 模拟SSE事件流数据
function generateMockSSEData() {
    const events = [
        'data: {"choices":[{"delta":{"content":"你好"}}]}',
        'data: {"choices":[{"delta":{"content":"！"}}]}',
        'data: {"choices":[{"delta":{"content":"SSE"}}]}',
        'data: {"choices":[{"delta":{"content":"（"}}]}',
        'data: {"choices":[{"delta":{"content":"Server"}}]}',
        'data: {"choices":[{"delta":{"content":"-"}}]}',
        'data: {"choices":[{"delta":{"content":"Sent"}}]}',
        'data: {"choices":[{"delta":{"content":"Events"}}]}',
        'data: {"choices":[{"delta":{"content":"）"}}]}',
        'data: {"choices":[{"delta":{"content":"是"}}]}',
        'data: {"choices":[{"delta":{"content":"一种"}}]}',
        'data: {"choices":[{"delta":{"content":"基于"}}]}',
        'data: {"choices":[{"delta":{"content":"HTTP"}}]}',
        'data: {"choices":[{"delta":{"content":"的"}}]}',
        'data: {"choices":[{"delta":{"content":"服务器"}}]}',
        'data: {"choices":[{"delta":{"content":"推送"}}]}',
        'data: {"choices":[{"delta":{"content":"技术"}}]}',
        'data: [DONE]'
    ];

    return events.join('\n');
}

// 演示错误处理
async function demonstrateErrorHandling() {
    console.log('\n=== 错误处理演示 ===\n');
    
    const adapter = new SSEAdapter();
    
    // 模拟连接失败
    const badConfig: ConnectionConfig = {
        url: 'https://invalid-url-that-will-fail.com/sse',
        maxReconnectAttempts: 2,
        retryOptions: {
            maxAttempts: 2,
            delay: 1000,
            backoff: 'exponential'
        }
    };

    try {
        await adapter.connect(badConfig);
    } catch (error) {
        console.log('✅ 预期的连接失败:', error instanceof Error ? error.message : String(error));
    }
}

// 演示重连机制
async function demonstrateReconnection() {
    console.log('\n=== 重连机制演示 ===\n');
    
    const adapter = new SSEAdapter();
    
    const config: ConnectionConfig = {
        url: 'https://api.example.com/sse-endpoint',
        maxReconnectAttempts: 3,
        retryOptions: {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential' // 指数退避
        }
    };

    console.log('测试重连机制配置:', {
        maxReconnectAttempts: config.maxReconnectAttempts,
        retryOptions: config.retryOptions
    });

    // 这里可以模拟连接中断的情况
    console.log('✅ 重连机制已配置完成');
}

// 主函数
async function main() {
    try {
        await demonstrateSSEAdapter();
        await demonstrateErrorHandling();
        await demonstrateReconnection();
        
        console.log('\n=== 所有演示完成 ===');
    } catch (error) {
        console.error('演示过程中出现错误:', error);
    }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
    main();
}

export { demonstrateSSEAdapter, simulateStreamRequest, generateMockSSEData };