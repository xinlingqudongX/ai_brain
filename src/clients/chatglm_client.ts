import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type {
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * ChatGLM客户端实现
 */
export class ChatGLMClient extends BaseAIClient {
    private deviceId: string;
    private authorization: string;
    private assistantId: string;
    public baseUrl: string = "https://chatglm.cn/chatglm/backend-api";

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.CHATGLM, credentials);
        this.deviceId = this.generateDeviceId();
        this.authorization = credentials.authorization || "";
        this.assistantId =
            credentials.assistantId || "65940acff94777010aa6b796";
    }

    /** 聊天会话 */
    public async conversation() {
        const res = await fetch(`${this.baseUrl}/assistant/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.authorization,
                "Device-Id": this.deviceId,
                // 添加其他必要的认证头
            },
            body: JSON.stringify({
                assistant_id: this.assistantId,
                conversation_id: this.generateUUID(),
                chat_type: "user_chat",
                meta_data: {
                    is_test: false,
                    input_question_type: "xxxx",
                    channel: "",
                },
            }),
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch conversation: ${res.status} ${res.statusText}`);
        }

        // 处理event-stream格式的数据流
        const reader = res.body?.getReader();
        if (!reader) {
            throw new Error("Failed to get response body reader");
        }

        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        return {
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        try {
                            const { done, value } = await reader.read();
                            if (done) {
                                return { done: true, value: undefined };
                            }

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split("\n");
                            buffer = lines.pop() || "";

                            for (const line of lines) {
                                if (line.startsWith("data: ")) {
                                    const data = line.slice(6);
                                    if (data === "[DONE]") {
                                        return { done: true, value: undefined };
                                    }
                                    try {
                                        return { done: false, value: JSON.parse(data) };
                                    } catch (e) {
                                        // 忽略无法解析的行
                                    }
                                }
                            }

                            return { done: false, value: undefined };
                        } catch (error) {
                            throw error;
                        }
                    },
                    async return() {
                        await reader.cancel();
                        return { done: true, value: undefined };
                    },
                    async throw(error: any) {
                        await reader.cancel();
                        throw error;
                    }
                };
            }
        };
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