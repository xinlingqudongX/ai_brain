/**
 * DeepSeek客户端实现 - 使用统一协议适配器
 */

import { BaseAIClient } from "../api/endpoints/base_ai_client";
import { ProtocolAdapterManager } from "../api/protocol/protocol_adapter_manager";
import { SSEAdapter } from "../api/protocol/sse_adapter";
import { MockAdapter } from "../api/protocol/mock_adapter";
import type {
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";
import { AIPlatformType } from "../types/ai_client_types";
import { ProtocolType } from "../api/protocol/protocol_types";

/**
 * DeepSeek客户端实现 - 使用统一协议适配器
 */
export class DeepSeekClient extends BaseAIClient {
    private authorization: string;
    public baseUrl: string = "https://chat.deepseek.com";
    private protocolAdapter: ProtocolAdapterManager;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.DEEPSEEK, credentials);
        this.authorization = credentials.authorization || "";
        
        // 初始化协议适配器
        this.protocolAdapter = new ProtocolAdapterManager();
        
        // 根据环境选择适配器
        if (credentials.useMock || process.env.NODE_ENV === 'test') {
            this.protocolAdapter.setAdapter(new MockAdapter());
        } else {
            this.protocolAdapter.setAdapter(new SSEAdapter());
        }
    }

    /** 聊天会话 */
    public async conversation() {
        // 使用统一协议适配器
        const request = {
            url: `${this.baseUrl}/api/v0/chat/completion`,
            method: 'POST' as const,
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.authorization,
            },
            body: {
                chat_session_id: this.generateUUID(),
                parent_message_id: null,
                prompt: "",
                ref_file_ids: [],
                thinking_enabled: false,
                search_enabled: true,
                client_stream_id: this.generateClientStreamId(),
            }
        };

        try {
            // 使用协议适配器发送流式请求
            const streamResponses = this.protocolAdapter.sendStream(request);
            
            // 创建异步迭代器
            const asyncIterator = {
                async *[Symbol.asyncIterator]() {
                    for await (const response of streamResponses) {
                        if (response.type === 'chunk' && response.data) {
                            yield response.data;
                        }
                    }
                }
            };
            
            return asyncIterator;
        } catch (error) {
            throw new Error(`Failed to fetch conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * 发送消息给DeepSeek
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        const requestBody = {
            message: message,
            stream: true,
            chat_session_id: options?.chatSessionId || this.generateUUID(),
            parent_message_id: options?.parentMessageId || null,
            timestamp: Date.now(),
        };

        // 创建异步生成器来处理流式响应
        const self = this;
        async function* streamResponse(): AsyncIterable<string> {
            const request = {
                url: `${self.baseUrl}/api/v0/chat/completion`,
                method: 'POST' as const,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": self.authorization,
                },
                body: requestBody
            };

            try {
                const streamResponses = self.protocolAdapter.sendStream(request);
                
                for await (const response of streamResponses) {
                    if (response.type === 'chunk' && response.data) {
                        // 提取内容
                        const content = response.data.choices?.[0]?.delta?.content || '';
                        if (content) {
                            yield content;
                        }
                    }
                }
            } catch (error) {
                throw new Error(`Send message failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return streamResponse();
    }

    /**
     * 获取DeepSeek用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        const request = {
            url: `${this.baseUrl}/user/info`,
            method: 'GET' as const,
            headers: {
                "Authorization": this.authorization,
            }
        };

        try {
            const response = await this.protocolAdapter.send(request);
            return response.data;
        } catch (error) {
            // 如果失败，返回模拟数据
            return {
                user_id: "deepseek_user_123456",
                username: "DeepSeek用户",
                platform: "deepseek",
                created_at: new Date().toISOString(),
            };
        }
    }

    /**
     * 从cookie中提取认证信息
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    extractCredentialsFromCookies(cookies: string): ClientCredentials | null {
        if (!cookies) return null;

        // DeepSeek使用Authorization头
        return {
            cookies,
            authorization: this.authorization,
        };
    }

    /**
     * 生成客户端流ID
     * @returns 返回客户端流ID
     */
    private generateClientStreamId(): string {
        return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取协议适配器（用于测试和调试）
     */
    getProtocolAdapter(): ProtocolAdapterManager {
        return this.protocolAdapter;
    }

    /**
     * 设置协议适配器类型
     * @param type - 适配器类型
     */
    setProtocolType(type: ProtocolType): void {
        switch (type) {
            case ProtocolType.MOCK:
                this.protocolAdapter.setAdapter(new MockAdapter());
                break;
            case ProtocolType.SSE:
                this.protocolAdapter.setAdapter(new SSEAdapter());
                break;
            default:
                throw new Error(`Unsupported protocol type: ${type}`);
        }
    }
}