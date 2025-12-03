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
        // 1. 创建POW挑战
        console.log("正在创建POW挑战...");
        const powChallenge = await client.createPowChallenge(
            "/api/v0/chat/completion"
        );
        console.log("POW挑战创建成功:", powChallenge);

        // 2. 检查响应是否成功
        if (powChallenge.code === 0 && powChallenge.data.biz_code === 0) {
            const challengeData = powChallenge.data.biz_data.challenge;
            console.log("挑战算法:", challengeData.algorithm);
            console.log("挑战值:", challengeData.challenge);
            console.log("盐值:", challengeData.salt);
            console.log("难度:", challengeData.difficulty);
            console.log(
                "过期时间:",
                new Date(challengeData.expire_at).toLocaleString()
            );

            // 这里可以使用挑战数据进行后续的操作
            // 例如：计算POW、创建会话等
        } else {
            console.error(
                "创建POW挑战失败:",
                powChallenge.msg || powChallenge.data.biz_msg
            );
        }
    } catch (error) {
        console.error("操作失败:", error);
    }
}

// 运行示例
example().catch(console.error);
