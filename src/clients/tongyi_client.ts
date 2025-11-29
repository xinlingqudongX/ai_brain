import axios, { AxiosInstance } from "axios";
import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type { TongyiModelsResponse, TongyiConversationRequest, TongyiMessageContent, TongyiSessionParams, TongyiLoginStatusResponse } from "../types/tongyi_types";
import type { TongyiAIResponse } from "../types/tongyi_response_types";
import {
    AIPlatformType,
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";

/**
 * 通义千问客户端实现
 */
export class TongyiClient extends BaseAIClient {
    private xsrfToken: string;
    private model: string;
    public baseUrl: string = "https://api.qianwen.com";
    private httpClient: AxiosInstance;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.TONGYI, credentials);
        this.sessionID = credentials.sessionId || this.generateUUID();
        this.xsrfToken = credentials.xsrfToken || "";
        this.model = credentials.model || "tongyi-qwen3-plus-model";
        
        // 创建 axios 实例并设置默认配置
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-platform": "pc_tongyi",
                "x-tw-from": "tongyi"
            }
        });

        // 设置请求拦截器，动态添加认证相关的头部
        this.httpClient.interceptors.request.use((config) => {
            // 设置 cookie
            if (this.credentials.cookies) {
                config.headers.cookie = this.credentials.cookies;
            }
            
            // 设置 xsrf token
            if (this.xsrfToken) {
                config.headers["x-xsrf-token"] = this.xsrfToken;
            }
            
            return config;
        });
    }

    /**
     * 发送普通消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        return this.sendTongyiMessage(message, options);
    }

    /**
     * 发送系统消息
     * @param message - 要发送的系统消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendSystemMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        return this.sendTongyiMessage(message, { ...options, messageType: "system" });
    }

    /**
     * 发送带深度思考的消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendDeepThinkMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        return this.sendTongyiMessage(message, { ...options, deepThink: true });
    }

    /**
     * 发送不联网搜索的消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendOfflineMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        return this.sendTongyiMessage(message, { ...options, searchType: "off" });
    }

    /**
     * 发送通义千问消息的内部实现
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    private async sendTongyiMessage(
        message: string,
        options?: SendMessageOptions & { 
            messageType?: string;
            deepThink?: boolean;
            searchType?: string;
        }
    ): Promise<AsyncIterable<string>> {
        // 确认模型已经选择
        if (!this.model) {
            throw new Error("Model not selected. Please select a model before sending messages.");
        }

        const parentMsgId = options?.parentId || this.generateUUID();
        const timeout = options?.timeout || 30000; // 默认30秒超时

        // 构建基础消息内容
        const messageContent: TongyiMessageContent = {
            content: message,
            contentType: "text",
            role: options?.messageType === "system" ? "system" : "user"
        };
        
        // 如果启用了深度思考，添加扩展参数
        if (options?.deepThink) {
            messageContent.ext = { deepThink: true };
        }

        // 构建基础会话参数
        const sessionParams: TongyiSessionParams = {
            specifiedModel: this.model,
            lastUseModelList: [this.model],
            recordModelName: this.model,
            bizSceneInfo: {}
        };
        
        // 如果启用了深度思考，添加相应参数
        if (options?.deepThink) {
            sessionParams.deepThink = true;
        }
        
        // 如果设置了搜索类型，添加相应参数
        if (options?.searchType) {
            sessionParams.searchType = options.searchType;
        }

        // 构建请求体，使用明确定义的类型
        const requestBody: TongyiConversationRequest = {
            sessionId: this.sessionID,
            sessionType: "text_chat",
            parentMsgId: parentMsgId,
            model: "", // 模型在params中指定
            mode: "chat",
            userAction: "",
            actionSource: "",
            contents: [messageContent],
            action: "next",
            requestId: this.generateUUID(),
            params: sessionParams
        };

        try {
            // 设置超时
            this.httpClient.defaults.timeout = timeout;

            const response = await this.httpClient.post(
                "/dialog/conversation",
                requestBody,
                {
                    headers: {
                        "content-type": "application/json",
                        accept: "text/event-stream",
                        priority: "u=1, i",
                    },
                    responseType: "stream"
                }
            );

            // 检查Content-Type是否为event-stream
            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.includes("text/event-stream")) {
                throw new Error("Response is not a valid event stream");
            }

            // 处理event-stream格式的数据流
            const stream = response.data;
            return this.processStream(stream);
        } catch (error: any) {
            // 区分不同类型的错误
            if (error.code === "ECONNABORTED") {
                throw new Error("Request timeout");
            }
            // 重新抛出其他错误
            throw error;
        }
    }

    /**
     * 处理SSE流数据
     * @param stream - axios流对象
     * @returns 异步可迭代的响应流
     */
    private async *processStream(
        stream: any
    ): AsyncIterable<string> {
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        // 定义事件类型常量
        const EVENT_TYPES = {
            DATA: "data",
            ERROR: "error",
            DONE: "[DONE]",
        } as const;

        try {
            for await (const chunk of stream) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith(`${EVENT_TYPES.DATA}: `)) {
                        const data = line.slice(`${EVENT_TYPES.DATA}: `.length);
                        if (data === EVENT_TYPES.DONE) {
                            return;
                        }
                        yield* this.parseStreamData(data);
                    } else if (line.startsWith(`${EVENT_TYPES.ERROR}: `)) {
                        const errorData = line.slice(
                            `${EVENT_TYPES.ERROR}: `.length
                        );
                        throw new Error(`Stream error: ${errorData}`);
                    }
                }
            }

            // 处理缓冲区中剩余的数据
            if (buffer.trim()) {
                const lines = buffer.split("\n");
                for (const line of lines) {
                    if (line.startsWith(`${EVENT_TYPES.DATA}: `)) {
                        const data = line.slice(
                            `${EVENT_TYPES.DATA}: `.length
                        );
                        if (data === EVENT_TYPES.DONE) {
                            return;
                        }
                        yield* this.parseStreamData(data);
                    }
                }
            }
        } catch (error: any) {
            // 流处理过程中发生错误
            throw new Error(`Error processing stream: ${error.message}`);
        }
    }

    /**
     * 解析流数据并提取内容
     * @param data - JSON格式的数据字符串
     * @returns 解析出的内容字符串
     */
    private *parseStreamData(data: string): Generator<string, void, unknown> {
        try {
            const parsedData = JSON.parse(data);

            // 处理不同的响应格式
            if (parsedData.choices && parsedData.choices.length > 0) {
                // 标准格式
                const content = parsedData.choices[0].delta?.content;
                if (content) {
                    yield content;
                }
            } else if (this.isTongyiAIResponse(parsedData)) {
                // 处理TongyiAIResponse类型
                const tongyiResponse = parsedData as TongyiAIResponse;
                
                // 检查是否有错误
                if (tongyiResponse.errorCode && tongyiResponse.errorCode !== "NOT_LOGIN") {
                    throw new Error(`Tongyi API error: ${tongyiResponse.errorCode}`);
                }
                
                // 如果有内容则返回
                if (tongyiResponse.content) {
                    yield tongyiResponse.content;
                }
                
                // 检查是否完成
                if (tongyiResponse.msgStatus === "finished") {
                    return;
                }
            } else if (parsedData.data) {
                // 可能的另一种格式
                yield parsedData.data;
            } else if (typeof parsedData === "string") {
                // 纯文本格式
                yield parsedData;
            }
            // 如果没有匹配的格式，不产生任何输出
        } catch (e) {
            // 忽略无法解析的数据
            console.warn("Failed to parse stream data:", data);
        }
    }

    /**
     * 检查对象是否为TongyiAIResponse类型
     * @param obj - 要检查的对象
     * @returns 是否为TongyiAIResponse类型
     */
    private isTongyiAIResponse(obj: any): obj is TongyiAIResponse {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'aiDisclaimer' in obj &&
            'canFeedback' in obj &&
            'canRegenerate' in obj &&
            'canShare' in obj &&
            'canShow' in obj &&
            'errorCode' in obj &&
            'extraType' in obj &&
            'incremental' in obj &&
            'msgStatus' in obj &&
            'passValue' in obj &&
            'sessionOpen' in obj &&
            'sessionShare' in obj &&
            'sessionWarnNew' in obj &&
            'webSearch' in obj
        );
    }

    /**
     * 获取通义千问用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        // 模拟用户信息响应
        return {
            user_id: "tongyi_user_123456",
            username: "通义千问用户",
            platform: "tongyi",
            created_at: new Date().toISOString(),
        };
    }

    /**
     * 获取通义千问模型列表
     * @returns 返回模型列表信息
     */
    async getModels(): Promise<TongyiModelsResponse> {
        const url = `/dialog/api/chat/config/getModelSeries`;

        const body = {
            configType: "MAIN_CHAT",
            interactionScene: "all_chat",
            version: "v1",
        };

        try {
            const response = await this.httpClient.post(url, body, {
                headers: {
                    "content-type": "application/json",
                    accept: "*/*",
                    priority: "u=1, i",
                }
            });

            const data = response.data as TongyiModelsResponse;
            return data;
        } catch (error: any) {
            throw new Error(`Error fetching Tongyi models: ${error.message}`);
        }
    }

    /**
     * 选择模型
     * @param modelCode - 模型代码
     * @returns 是否选择成功
     */
    async selectModel(modelCode: string): Promise<boolean> {
        // 首先验证模型是否可用
        try {
            const models = await this.getModels();
            
            // 检查模型是否存在
            const modelExists = models.data.some(series => 
                series.params.some(param => param.modelCode === modelCode)
            );
            
            if (!modelExists) {
                throw new Error(`Model ${modelCode} not found`);
            }
            
            // 设置当前模型
            this.model = modelCode;
            return true;
        } catch (error: any) {
            console.error(`Failed to select model ${modelCode}:`, error.message);
            return false;
        }
    }

    /**
     * 获取当前选择的模型
     * @returns 当前模型代码
     */
    getCurrentModel(): string {
        return this.model;
    }

    /**
     * 获取所有可用模型的简化列表
     * @returns 模型代码列表
     */
    async getAvailableModels(): Promise<string[]> {
        try {
            const models = await this.getModels();
            const modelCodes: string[] = [];
            
            models.data.forEach(series => {
                series.params.forEach(param => {
                    modelCodes.push(param.modelCode);
                });
            });
            
            return modelCodes;
        } catch (error: any) {
            console.error("Failed to get available models:", error.message);
            return [];
        }
    }

    /**
     * 设置会话参数
     * @param params - 会话参数
     */
    async setSessionParams(params: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        contextLimit?: number;
    }): Promise<void> {
        // 在请求体中设置会话参数
        console.log("Setting session parameters:", params);
        // 实际实现需要根据API要求调整
    }

    /**
     * 获取会话历史
     * @param limit - 返回的历史记录数量
     * @returns 会话历史记录
     */
    async getConversationHistory(limit: number = 10): Promise<any[]> {
        // 模拟获取会话历史
        console.log(`Getting conversation history, limit: ${limit}`);
        return [];
    }

    /**
     * 清除会话上下文
     */
    async clearConversationContext(): Promise<void> {
        // 生成新的会话ID以清除上下文
        this.sessionID = this.generateUUID();
    }

    /**
     * 从cookie中提取认证信息
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    extractCredentialsFromCookies(cookies: string): ClientCredentials | null {
        if (!cookies) return null;

        const xsrfTokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
        const sessionMatch = cookies.match(/SESSION=([^;]+)/);

        if (!xsrfTokenMatch && !sessionMatch) {
            return null;
        }

        return {
            cookies,
            xsrfToken: xsrfTokenMatch ? xsrfTokenMatch[1] : "",
            sessionId: sessionMatch ? sessionMatch[1] : "",
        };
    }

    /**
     * 检查用户登录状态
     * @returns 返回登录状态信息
     */
    async checkLoginStatus(): Promise<{ isLoggedIn: boolean; userInfo?: TongyiLoginStatusResponse["data"] }> {
        const url = `/assistant/api/user/info/get?isLogin&c=tongyi-web`;

        try {
            const response = await this.httpClient.get(url, {
                headers: {
                    accept: "application/json, text/plain, */*",
                    priority: "u=1, i",
                }
            });

            const data: TongyiLoginStatusResponse = response.data;
            
            // 根据响应数据判断登录状态
            // 如果返回了用户信息，则认为已登录
            if (data.success && data.data && data.data.userId) {
                return { 
                    isLoggedIn: true, 
                    userInfo: data.data
                };
            }
            
            return { isLoggedIn: false };
        } catch (error: any) {
            console.error("Failed to check login status:", error.message);
            return { isLoggedIn: false };
        }
    }
}