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
import axios, { AxiosInstance } from "axios";
import type {
    DeepSeekCreateSessionResponse,
    DeepSeekSession,
} from "../types/deepseek_types";

/**
 * DeepSeek客户端实现 - 使用统一协议适配器
 */
export class DeepSeekClient extends BaseAIClient {
    private authorization: string;
    public baseUrl: string = "https://chat.deepseek.com";
    private protocolAdapter: ProtocolAdapterManager;
    private httpClient: AxiosInstance;
    private currentSession: DeepSeekSession | null = null;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.DEEPSEEK, credentials);
        this.authorization = credentials.authorization || "";

        // 创建 axios 实例并设置默认配置
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                accept: "*/*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua":
                    '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-app-version": "20241129.1",
                "x-client-locale": "zh_CN",
                "x-client-platform": "web",
                "x-client-version": "1.5.0",
                "x-debug-lite-model-channel": "prod",
                "x-debug-model-channel": "prod",
            },
        });

        // 设置请求拦截器，动态添加认证相关的头部
        this.httpClient.interceptors.request.use((config) => {
            // 设置 authorization
            if (this.authorization) {
                config.headers.Authorization = `Bearer ${this.authorization}`;
            }

            // 设置 cookie
            if (this.credentials.cookies) {
                config.headers.cookie = this.credentials.cookies;
            }

            return config;
        });

        // 初始化协议适配器
        this.protocolAdapter = new ProtocolAdapterManager();

        // 根据环境选择适配器
        if (credentials.useMock || process.env.NODE_ENV === "test") {
            this.protocolAdapter.setAdapter(new MockAdapter());
        } else {
            this.protocolAdapter.setAdapter(new SSEAdapter());
        }
    }

    /**
     * 创建新的聊天会话
     * @returns 返回会话ID
     */
    async createSession(): Promise<string> {
        try {
            const response =
                await this.httpClient.post<DeepSeekCreateSessionResponse>(
                    "/api/v0/chat_session/create",
                    {}, // 空的请求体
                    {
                        headers: {
                            "content-type": "application/json",
                        },
                    }
                );

            // 检查响应是否成功
            if (response.data.code === 0) {
                // 保存会话信息
                const sessionData = response.data.data.biz_data;
                this.currentSession = {
                    id: sessionData.id,
                    seqId: sessionData.seq_id,
                    agent: sessionData.agent,
                    title: sessionData.title,
                    titleType: sessionData.title_type,
                    version: sessionData.version,
                    currentMessageId: sessionData.current_message_id,
                    pinned: sessionData.pinned,
                    insertedAt: sessionData.inserted_at,
                    updatedAt: sessionData.updated_at,
                };

                return sessionData.id;
            } else {
                throw new Error(
                    `Failed to create session: ${response.data.msg}`
                );
            }
        } catch (error) {
            throw new Error(
                `Failed to create session: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * 获取当前会话ID
     * @returns 返回当前会话ID，如果没有会话则返回null
     */
    getCurrentSessionId(): string | null {
        return this.currentSession ? this.currentSession.id : null;
    }

    /** 聊天会话 */
    public async conversation() {
        // 使用统一协议适配器
        const request = {
            url: `${this.baseUrl}/api/v0/chat/completion`,
            method: "POST" as const,
            headers: {
                "Content-Type": "application/json",
                Authorization: this.authorization,
            },
            body: {
                chat_session_id: this.generateUUID(),
                parent_message_id: null,
                prompt: "",
                ref_file_ids: [],
                thinking_enabled: false,
                search_enabled: true,
                client_stream_id: this.generateClientStreamId(),
            },
        };

        try {
            // 使用协议适配器发送流式请求
            const streamResponses = this.protocolAdapter.sendStream(request);

            // 创建异步迭代器
            const asyncIterator = {
                async *[Symbol.asyncIterator]() {
                    for await (const response of streamResponses) {
                        if (response.type === "chunk" && response.data) {
                            yield response.data;
                        }
                    }
                },
            };

            return asyncIterator;
        } catch (error) {
            throw new Error(
                `Failed to fetch conversation: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
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
        // 如果还没有会话，先创建一个
        if (!this.currentSession) {
            await this.createSession();
        }

        const requestBody = {
            message: message,
            stream: true,
            chat_session_id:
                options?.chatSessionId ||
                this.currentSession?.id ||
                this.generateUUID(),
            parent_message_id: options?.parentMessageId || null,
            timestamp: Date.now(),
        };

        // 创建异步生成器来处理流式响应
        const self = this;
        async function* streamResponse(): AsyncIterable<string> {
            const request = {
                url: `${self.baseUrl}/api/v0/chat/completion`,
                method: "POST" as const,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: self.authorization,
                },
                body: requestBody,
            };

            try {
                const streamResponses =
                    self.protocolAdapter.sendStream(request);

                for await (const response of streamResponses) {
                    if (response.type === "chunk" && response.data) {
                        // 提取内容
                        const content =
                            response.data.choices?.[0]?.delta?.content || "";
                        if (content) {
                            yield content;
                        }
                    }
                }
            } catch (error) {
                throw new Error(
                    `Send message failed: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
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
            method: "GET" as const,
            headers: {
                Authorization: this.authorization,
            },
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
     * 删除会话
     * @param sessionId - 要删除的会话ID
     */
    async deleteSession(sessionId: string): Promise<void> {
        // 重置当前会话
        if (this.currentSession && this.currentSession.id === sessionId) {
            this.currentSession = null;
        }
        // DeepSeek API可能没有专门的删除会话端点，这里只是重置本地状态
        // 如果需要实际删除远程会话，需要添加相应的API调用
    }

    /**
     * 生成客户端流ID
     * @returns 返回客户端流ID
     */
    private generateClientStreamId(): string {
        return `stream_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
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