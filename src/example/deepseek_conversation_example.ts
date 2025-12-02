import { DeepSeekClient } from "../clients/deepseek_client";
import { ClientCredentials } from "../types/ai_client_types";

async function example() {
    // 创建客户端实例
    const credentials: ClientCredentials = {
        cookies: "your_cookies_here",
        authorization: "your_token_here", // Bearer token
    };

    const client = new DeepSeekClient(credentials);

    try {
        // 1. 创建新的会话
        console.log("正在创建会话...");
        const sessionId = await client.createSession();
        console.log("会话创建成功，会话ID:", sessionId);

        // 2. 使用conversation方法进行聊天
        console.log("\n正在使用conversation方法进行聊天...");
        const conversationResponse = await client.conversation();

        // 3. 流式处理响应
        console.log("Conversation响应:");
        for await (const chunk of conversationResponse) {
            process.stdout.write(chunk);
        }
        console.log("\nConversation完成");

        // 4. 发送消息
        console.log("\n正在发送消息...");
        const messageResponse = await client.sendMessage(
            "你好，DeepSeek！请简单介绍一下自己。"
        );

        // 5. 流式处理响应
        console.log("消息响应:");
        for await (const chunk of messageResponse) {
            process.stdout.write(chunk);
        }
        console.log("\n消息发送完成");

        // 6. 获取用户信息
        console.log("\n正在获取用户信息...");
        const userInfo = await client.getUserInfo();
        console.log("用户信息:", userInfo);

        // 7. 删除会话
        console.log("\n正在删除会话...");
        await client.deleteSession(sessionId);
        console.log("会话删除成功");
    } catch (error) {
        console.error("操作失败:", error);
    }
}

// 运行示例
example().catch(console.error);
