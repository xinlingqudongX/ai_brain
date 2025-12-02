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

        // 2. 获取当前会话ID
        const currentSessionId = client.getCurrentSessionId();
        console.log("当前会话ID:", currentSessionId);

        // 3. 发送消息（会自动使用已创建的会话）
        console.log("\n正在发送消息...");
        const response = await client.sendMessage("你好，DeepSeek！");

        // 4. 流式处理响应
        let fullResponse = "";
        for await (const chunk of response) {
            process.stdout.write(chunk);
            fullResponse += chunk;
        }
        console.log("\n完整响应:", fullResponse);

        // 5. 删除会话
        console.log("\n正在删除会话...");
        await client.deleteSession(sessionId);
        console.log("会话删除成功");
    } catch (error) {
        console.error("操作失败:", error);
    }
}

// 运行示例
example().catch(console.error);
