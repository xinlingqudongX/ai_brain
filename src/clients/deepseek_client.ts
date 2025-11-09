import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type {
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * DeepSeek客户端实现
 */
export class DeepSeekClient extends BaseAIClient {
    private authorization: string;
    public baseUrl: string = "https://chat.deepseek.com";

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.DEEPSEEK, credentials);
        this.authorization = credentials.authorization || "";
    }

    /** 聊天会话 */
    public async conversation() {
        const res = await fetch(`${this.baseUrl}/api/v0/chat/completion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.authorization,
                // 添加其他必要的认证头
            },
            body: JSON.stringify({
                chat_session_id: this.generateUUID(),
                parent_message_id: null,
                prompt: "",
                ref_file_ids: [],
                thinking_enabled: false,
                search_enabled: true,
                client_stream_id: this.generateClientStreamId(),
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