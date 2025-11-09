import { TongyiClient } from "../clients/tongyi_client";
import { ChatGLMClient } from "../clients/chatglm_client";
import { BaiduClient } from "../clients/baidu_client";
import { DeepSeekClient } from "../clients/deepseek_client";
import { QwenClient } from "../clients/qwen_client";

async function testConversations() {
    console.log("Testing all AI client conversation functions...");

    // 测试通义千问客户端
    try {
        console.log("\n1. Testing Tongyi Client...");
        const tongyiClient = new TongyiClient({
            cookies: "test_cookies",
            xsrfToken: "test_xsrf_token",
            sessionId: "test_session_id"
        });
        console.log("Tongyi client created successfully");
    } catch (error) {
        console.error("Error creating Tongyi client:", error);
    }

    // 测试ChatGLM客户端
    try {
        console.log("\n2. Testing ChatGLM Client...");
        const chatglmClient = new ChatGLMClient({
            cookies: "test_cookies",
            authorization: "Bearer test_token"
        });
        console.log("ChatGLM client created successfully");
    } catch (error) {
        console.error("Error creating ChatGLM client:", error);
    }

    // 测试百度客户端
    try {
        console.log("\n3. Testing Baidu Client...");
        const baiduClient = new BaiduClient({
            cookies: "test_cookies"
        });
        console.log("Baidu client created successfully");
    } catch (error) {
        console.error("Error creating Baidu client:", error);
    }

    // 测试DeepSeek客户端
    try {
        console.log("\n4. Testing DeepSeek Client...");
        const deepseekClient = new DeepSeekClient({
            cookies: "test_cookies",
            authorization: "Bearer test_token"
        });
        console.log("DeepSeek client created successfully");
    } catch (error) {
        console.error("Error creating DeepSeek client:", error);
    }

    // 测试通义千问(Qwen)客户端
    try {
        console.log("\n5. Testing Qwen Client...");
        const qwenClient = new QwenClient({
            cookies: "test_cookies",
            chatId: "test_chat_id"
        });
        console.log("Qwen client created successfully");
    } catch (error) {
        console.error("Error creating Qwen client:", error);
    }

    console.log("\nAll client creation tests completed!");
}

// 运行测试
testConversations().catch(console.error);