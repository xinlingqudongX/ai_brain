import { BaseAIClient } from "./base_ai_client";
import {
    AIPlatformType,
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";

/**
 * DeepSeek客户端实现
 */
export class DeepSeekClient extends BaseAIClient {
    private authorization: string;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.DEEPSEEK, credentials);
        this.authorization = credentials.authorization || "";
    }

    /**
     * 发送消息给DeepSeek AI
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        // 构建请求体
        const requestBody = {
            chat_session_id: options?.conversationId || this.generateUUID(),
            parent_message_id: options?.parentId || null,
            prompt: message,
            ref_file_ids: [],
            thinking_enabled: false,
            search_enabled: true,
            client_stream_id: this.generateClientStreamId(),
        };

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
            // 这里应该是实际的API调用
            // 由于我们没有真实的API访问权限，返回模拟数据
            yield JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: "这是来自DeepSeek的模拟响应: " + message,
                        },
                    },
                ],
            });
            yield JSON.stringify({
                choices: [{ delta: { content: "\n感谢您的消息！" } }],
            });
        }

        return streamResponse();
    }

    /**
     * 获取DeepSeek用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        // 模拟用户信息响应
        return {
            user_id: "deepseek_user_123456",
            username: "DeepSeek用户",
            platform: "deepseek",
            created_at: new Date().toISOString(),
        };
    }

    /**
     * 从cookie中提取认证信息
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    extractCredentialsFromCookies(cookies: string): ClientCredentials | null {
        if (!cookies) return null;

        // DeepSeek使用authorization header和cookies
        const sessionIdMatch = cookies.match(/ds_session_id=([^;]+)/);

        if (!sessionIdMatch && !this.authorization) {
            return null;
        }

        return {
            cookies,
            authorization: this.authorization,
        };
    }

    /**
     * 生成客户端流ID
     * @returns 返回生成的客户端流ID
     */
    private generateClientStreamId(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const randomPart = Math.random().toString(36).substring(2, 16);
        return `${year}${month}${day}-${randomPart}`;
    }
}
