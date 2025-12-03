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

        // 2. 发送一个长时间运行的消息
        console.log("\n正在发送消息...");
        const messageResponse = await client.sendMessage(
            "请写一篇关于人工智能发展的长篇文章"
        );

        // 3. 收集一些响应内容
        console.log("消息响应 (部分):");
        let counter = 0;
        let messageId = 1; // 假设这是我们要停止的消息ID

        for await (const chunk of messageResponse) {
            process.stdout.write(chunk);
            counter++;

            // 在收到一定数量的响应后，停止消息流
            if (counter > 10) {
                console.log("\n\n正在停止消息流...");
                const stopResult = await client.stopMessageStream(messageId);
                console.log("停止结果:", stopResult);
                break;
            }
        }

        // 4. 删除会话
        console.log("\n正在删除会话...");
        await client.deleteSession(sessionId);
        console.log("会话删除成功");
    } catch (error) {
        console.error("操作失败:", error);
    }
}

// 运行示例
example().catch(console.error);
