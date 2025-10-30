import { BaseAIClient } from "./base_ai_client";
import {
    AIPlatformType,
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";

/**
 * ChatGLM客户端实现
 */
export class ChatGLMClient extends BaseAIClient {
    private deviceId: string;
    private authorization: string;
    private assistantId: string;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.CHATGLM, credentials);
        this.deviceId = this.generateDeviceId();
        this.authorization = credentials.authorization || "";
        this.assistantId =
            credentials.assistantId || "65940acff94777010aa6b796";
    }

    /**
     * 生成设备ID
     * @returns 返回生成的设备ID
     */
    private generateDeviceId(): string {
        return this.generateUUID().replace(/-/g, "");
    }

    /**
     * 发送消息给ChatGLM
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        const conversationId = options?.conversationId || this.generateUUID();

        const requestBody = {
            assistant_id: this.assistantId,
            conversation_id: conversationId,
            chat_type: "user_chat",
            meta_data: {
                cogview: {
                    rm_label_watermark: false,
                },
                is_test: false,
                input_question_type: "xxxx",
                channel: "",
                draft_id: "",
                is_networking: false,
                chat_mode: "zero",
                quote_log_id: "",
                platform: "pc",
            },
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: message,
                        },
                    ],
                },
            ],
        };

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
            // 这里应该是实际的API调用
            // 由于我们没有真实的API访问权限，返回模拟数据
            yield JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: "这是来自ChatGLM的模拟响应: " + message,
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
     * 获取ChatGLM用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        // 模拟用户信息响应
        return {
            user_id: "chatglm_user_123456",
            username: "ChatGLM用户",
            platform: "chatglm",
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

        const tokenMatch = cookies.match(/chatglm_token=([^;]+)/);
        const userIdMatch = cookies.match(/chatglm_user_id=([^;]+)/);

        if (!tokenMatch && !userIdMatch) {
            return null;
        }

        return {
            cookies,
            authorization: tokenMatch ? `Bearer ${tokenMatch[1]}` : "",
            userId: userIdMatch ? userIdMatch[1] : "",
        };
    }
}
