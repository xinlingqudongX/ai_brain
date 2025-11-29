/**
 * 通义千问(Qwen)客户端实现 - 使用统一协议适配器
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
 * 通义千问(Qwen)客户端实现 - 使用统一协议适配器
 */
export class QwenClient extends BaseAIClient {
    private chatId: string;
    private model: string;
    public baseUrl: string = "https://qianwen.aliyun.com";
    private protocolAdapter: ProtocolAdapterManager;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.QWEN, credentials);
        this.chatId = credentials.chatId || this.generateUUID();
        this.model = credentials.model || "qwen3-coder-plus";
        
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
            url: `${this.baseUrl}/conversation`,
            method: 'POST' as const,
            headers: {
                "Content-Type": "application/json",
                "Cookie": this.credentials.cookies,
            },
            body: {
                chat_id: this.chatId,
                model: this.model,
                stream: true,
                incremental_output: true,
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

        // 创建异步生成器来处理流式响应
        const self = this;
        async function* streamResponse(): AsyncIterable<string> {
            const request = {
                url: `${self.baseUrl}/api/chat`,
                method: 'POST' as const,
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": self.credentials.cookies,
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
     * 获取通义千问用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        const request = {
            url: `${this.baseUrl}/user/info`,
            method: 'GET' as const,
            headers: {
                "Cookie": this.credentials.cookies,
            }
        };

        try {
            const response = await this.protocolAdapter.send(request);
            return response.data;
        } catch (error) {
            // 如果失败，返回模拟数据
            return {
                user_id: "qwen_user_123456",
                username: "通义千问用户",
                platform: "qwen",
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