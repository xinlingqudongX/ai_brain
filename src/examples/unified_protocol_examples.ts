/**
 * 统一协议适配器使用示例
 * 演示如何使用重构后的AI客户端进行流式交互
 */

import { QwenClient } from '../clients/qwen_client';
import { BaiduClient } from '../clients/baidu_client';
import { DeepSeekClient } from '../clients/deepseek_client';
import { ChatGLMClient } from '../clients/chatglm_client';
import { TongyiClient } from '../clients/tongyi_client';
import { ProtocolType } from '../api/protocol/protocol_types';
import { MockAdapter } from '../api/protocol/mock_adapter';

/**
 * 示例1: 使用通义千问客户端进行流式对话
 */
async function example1_QwenStreaming() {
    console.log('=== 示例1: 通义千问流式对话 ===');
    
    const qwenClient = new QwenClient({
        cookies: 'your_qwen_cookies_here',
        model: 'qwen3-coder-plus',
        useMock: true // 使用模拟数据进行演示
    });

    try {
        // 发送流式消息
        const responseStream = await qwenClient.sendMessage('你好，请介绍一下自己');
        
        console.log('通义千问回复:');
        for await (const chunk of responseStream) {
            process.stdout.write(chunk);
        }
        console.log('\n--- 对话结束 ---\n');
        
    } catch (error) {
        console.error('通义千问对话失败:', error);
    }
}

/**
 * 示例2: 使用百度客户端进行流式对话
 */
async function example2_BaiduStreaming() {
    console.log('=== 示例2: 百度流式对话 ===');
    
    const baiduClient = new BaiduClient({
        cookies: 'your_baidu_cookies_here',
        useMock: true // 使用模拟数据进行演示
    });

    try {
        // 发送流式消息
        const responseStream = await baiduClient.sendMessage('请帮我写一段Python代码');
        
        console.log('百度回复:');
        for await (const chunk of responseStream) {
            process.stdout.write(chunk);
        }
        console.log('\n--- 对话结束 ---\n');
        
    } catch (error) {
        console.error('百度对话失败:', error);
    }
}

/**
 * 示例3: 使用DeepSeek客户端进行流式对话
 */
async function example3_DeepSeekStreaming() {
    console.log('=== 示例3: DeepSeek流式对话 ===');
    
    const deepseekClient = new DeepSeekClient({
        cookies: 'your_deepseek_cookies_here',
        authorization: 'your_deepseek_authorization_here',
        useMock: true // 使用模拟数据进行演示
    });

    try {
        // 发送流式消息
        const responseStream = await deepseekClient.sendMessage('解释一下机器学习的基本概念');
        
        console.log('DeepSeek回复:');
        for await (const chunk of responseStream) {
            process.stdout.write(chunk);
        }
        console.log('\n--- 对话结束 ---\n');
        
    } catch (error) {
        console.error('DeepSeek对话失败:', error);
    }
}

/**
 * 示例4: 切换协议适配器类型
 */
async function example4_SwitchProtocolType() {
    console.log('=== 示例4: 切换协议适配器类型 ===');
    
    const qwenClient = new QwenClient({
        cookies: 'your_qwen_cookies_here',
        model: 'qwen3-coder-plus',
        useMock: true
    });

    try {
        // 首先使用Mock适配器
        console.log('使用Mock适配器:');
        const mockResponse = await qwenClient.sendMessage('这是一个测试消息');
        
        let mockResult = '';
        for await (const chunk of mockResponse) {
            mockResult += chunk;
        }
        console.log('Mock结果:', mockResult);
        
        // 切换到SSE适配器（实际使用时）
        // qwenClient.setProtocolType(ProtocolType.SSE);
        // console.log('切换到SSE适配器');
        
    } catch (error) {
        console.error('切换协议适配器失败:', error);
    }
}

/**
 * 示例5: 获取用户信息
 */
async function example5_GetUserInfo() {
    console.log('=== 示例5: 获取用户信息 ===');
    
    const clients = [
        { name: '通义千问', client: new QwenClient({ cookies: 'test', useMock: true }) },
        { name: '百度', client: new BaiduClient({ cookies: 'test', useMock: true }) },
        { name: 'DeepSeek', client: new DeepSeekClient({ cookies: 'test', authorization: 'test', useMock: true }) }
    ];

    for (const { name, client } of clients) {
        try {
            const userInfo = await client.getUserInfo();
            console.log(`${name}用户信息:`, userInfo);
        } catch (error) {
            console.error(`获取${name}用户信息失败:`, error);
        }
    }
}

/**
 * 示例6: 使用自定义Mock数据
 */
async function example6_CustomMockData() {
    console.log('=== 示例6: 使用自定义Mock数据 ===');
    
    // 创建自定义Mock适配器
    const customMockAdapter = new MockAdapter([
        { content: '这是自定义的', delta: { content: '这' } },
        { content: '这是自定义的', delta: { content: '是' } },
        { content: '这是自定义的', delta: { content: '自' } },
        { content: '这是自定义的', delta: { content: '定' } },
        { content: '这是自定义的', delta: { content: '义' } },
        { content: '这是自定义的', delta: { content: '的' } },
        { content: '这是自定义的', delta: { content: '' }, finish_reason: 'stop' }
    ]);

    // 注意：这里需要修改客户端以支持注入自定义适配器
    // 这里仅作为概念演示
    console.log('自定义Mock数据已准备就绪');
}

/**
 * 示例7: 错误处理
 */
async function example7_ErrorHandling() {
    console.log('=== 示例7: 错误处理 ===');
    
    const qwenClient = new QwenClient({
        cookies: 'invalid_cookies',
        useMock: false // 不使用Mock，模拟真实错误
    });

    try {
        // 设置SSE适配器来模拟真实错误
        qwenClient.setProtocolType(ProtocolType.SSE);
        
        const response = await qwenClient.sendMessage('测试错误处理');
        
        for await (const chunk of response) {
            console.log('收到回复:', chunk);
        }
        
    } catch (error) {
        console.log('捕获到错误:', error instanceof Error ? error.message : error);
    }
}

/**
 * 主函数 - 运行所有示例
 */
async function main() {
    console.log('开始运行统一协议适配器示例...\n');
    
    try {
        await example1_QwenStreaming();
        await example2_BaiduStreaming();
        await example3_DeepSeekStreaming();
        await example4_SwitchProtocolType();
        await example5_GetUserInfo();
        await example6_CustomMockData();
        await example7_ErrorHandling();
        
        console.log('\n所有示例运行完成！');
        
    } catch (error) {
        console.error('运行示例时发生错误:', error);
    }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

export {
    example1_QwenStreaming,
    example2_BaiduStreaming,
    example3_DeepSeekStreaming,
    example4_SwitchProtocolType,
    example5_GetUserInfo,
    example6_CustomMockData,
    example7_ErrorHandling
};