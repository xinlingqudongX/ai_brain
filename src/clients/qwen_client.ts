import { BaseAIClient } from "../api/endpoints/base_ai_client.js";
import type {
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types.js";
import { AIPlatformType } from "../types/ai_client_types.js";

/**
 * 通义千问(Qwen)客户端实现
 */
export class QwenClient extends BaseAIClient {
    private chatId: string;
    private model: string;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.QWEN, credentials);
        this.chatId = credentials.chatId || this.generateUUID();
        this.model = credentials.model || "qwen3-coder-plus";
    }

    /**
     * 发送消息给通义千问
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        const parentId = options?.parentId || this.generateUUID();
        const messageId = this.generateUUID();

        // 构建请求体
        const requestBody = {
            stream: true,
            incremental_output: true,
            chat_id: this.chatId,
            chat_mode: "guest",
            model: this.model,
            parent_id: parentId,
            messages: [
                {
                    fid: messageId,
                    parentId: parentId,
                    childrenIds: [],
                    role: "user",
                    content: message,
                    user_action: "chat",
                    files: [],
                    timestamp: Date.now(),
                    models: [this.model],
                    chat_type: "t2t",
                    feature_config: {
                        thinking_enabled: false,
                        output_schema: "phase",
                    },
                    extra: {
                        meta: {
                            subChatType: "t2t",
                        },
                    },
                    sub_chat_type: "t2t",
                    parent_id: parentId,
                },
            ],
            timestamp: Date.now(),
        };

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
            // 这里应该是实际的API调用
            // 由于我们没有真实的API访问权限，返回模拟数据
            yield JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: "这是来自通义千问的模拟响应: " + message,
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
     * 获取通义千问用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        // 模拟用户信息响应
        return {
            user_id: "qwen_user_123456",
            username: "通义千问用户",
            platform: "qwen",
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

        // 通义千问使用复杂的认证机制
        const acwTcMatch = cookies.match(/acw_tc=([^;]+)/);
        const cnaMatch = cookies.match(/cna=([^;]+)/);

        if (!acwTcMatch && !cnaMatch) {
            return null;
        }

        return {
            cookies,
            acwTc: acwTcMatch ? acwTcMatch[1] : "",
            cna: cnaMatch ? cnaMatch[1] : "",
        };
    }
}
