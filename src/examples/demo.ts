/**
 * 统一协议适配器演示
 * 简单的交互式演示
 */

import { QwenClient } from '../clients/qwen_client';
import { BaiduClient } from '../clients/baidu_client';
import { DeepSeekClient } from '../clients/deepseek_client';
import { ProtocolType } from '../api/protocol/protocol_types';

/**
 * 简单的交互式演示
 */
async function interactiveDemo() {
    console.log('🤖 AI客户端统一协议适配器演示');
    console.log('=====================================\n');

    // 创建客户端
    const clients = {
        '1': { name: '通义千问', client: new QwenClient({ cookies: 'demo', useMock: true }) },
        '2': { name: '百度', client: new BaiduClient({ cookies: 'demo', useMock: true }) },
        '3': { name: 'DeepSeek', client: new DeepSeekClient({ cookies: 'demo', authorization: 'demo', useMock: true }) }
    };

    // 选择客户端
    console.log('请选择AI平台:');
    Object.entries(clients).forEach(([key, { name }]) => {
        console.log(`${key}. ${name}`);
    });

    // 模拟选择（在实际环境中可以从用户输入读取）
    const selectedClient = clients['1']; // 默认选择通义千问
    
    console.log(`\n已选择: ${selectedClient.name}`);
    console.log('正在初始化...\n');

    try {
        // 获取用户信息
        const userInfo = await selectedClient.client.getUserInfo();
        console.log(`👤 用户信息: ${userInfo.username || userInfo.user_id}`);

        // 发送测试消息
        const testMessage = '你好，请简单介绍一下自己';
        console.log(`\n💬 发送消息: ${testMessage}`);
        console.log('📝 回复: ');

        const responseStream = await selectedClient.client.sendMessage(testMessage);
        
        for await (const chunk of responseStream) {
            process.stdout.write(chunk);
        }
        
        console.log('\n\n✅ 演示完成！');
        
    } catch (error) {
        console.error('❌ 演示失败:', error instanceof Error ? error.message : error);
    }
}

/**
 * 快速测试函数
 */
async function quickTest() {
    console.log('🚀 快速测试统一协议适配器...\n');

    const client = new QwenClient({
        cookies: 'test_cookies',
        useMock: true
    });

    try {
        const response = await client.sendMessage('测试消息');
        
        console.log('流式响应:');
        for await (const chunk of response) {
            process.stdout.write(chunk);
        }
        console.log('\n');
        
        console.log('✅ 快速测试通过！');
        
    } catch (error) {
        console.error('❌ 快速测试失败:', error);
    }
}

/**
 * 协议适配器切换演示
 */
async function protocolSwitchDemo() {
    console.log('🔄 协议适配器切换演示...\n');

    const client = new QwenClient({
        cookies: 'test_cookies',
        useMock: true
    });

    try {
        // 当前协议类型
        const currentProtocol = client.getProtocolAdapter().getProtocolType();
        console.log(`当前协议: ${currentProtocol}`);

        // 测试当前协议
        console.log('当前协议测试:');
        const response1 = await client.sendMessage('协议测试1');
        for await (const chunk of response1) {
            process.stdout.write(chunk);
        }
        console.log('\n');

        // 切换到SSE协议（实际使用时）
        // client.setProtocolType(ProtocolType.SSE);
        // console.log(`切换到协议: ${ProtocolType.SSE}`);

        console.log('✅ 协议适配器切换演示完成！');
        
    } catch (error) {
        console.error('❌ 协议切换演示失败:', error);
    }
}

// 主函数
async function main() {
    // 运行快速测试
    await quickTest();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 运行交互式演示
    await interactiveDemo();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 运行协议切换演示
    await protocolSwitchDemo();
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

export {
    interactiveDemo,
    quickTest,
    protocolSwitchDemo
};