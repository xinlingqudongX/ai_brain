import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type { TongyiModelsResponse, TongyiConversationRequest, TongyiMessageContent, TongyiSessionParams } from "../types/tongyi_types";
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
    public baseUrl: string = "https://api.tongyi.com";

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.TONGYI, credentials);
        this.sessionID = credentials.sessionId || this.generateUUID();
        this.xsrfToken = credentials.xsrfToken || "";
        this.model = credentials.model || "tongyi-qwen3-plus-model";
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

        const headers = {
            accept: "text/event-stream",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "content-type": "application/json",
            priority: "u=1, i",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-platform": "pc_tongyi",
            "x-xsrf-token": this.xsrfToken,
            cookie: this.credentials.cookies || "",
        };

        try {
            // 创建带超时的请求
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(
                `${this.baseUrl}/dialog/conversation`,
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                // 根据不同的状态码提供更详细的错误信息
                let errorMessage = `Failed to send message: ${response.status} ${response.statusText}`;
                switch (response.status) {
                    case 401:
                        errorMessage =
                            "Authentication failed. Please check your credentials.";
                        break;
                    case 403:
                        errorMessage =
                            "Access forbidden. You don't have permission to access this resource.";
                        break;
                    case 429:
                        errorMessage =
                            "Rate limit exceeded. Please try again later.";
                        break;
                    case 500:
                        errorMessage =
                            "Internal server error. Please try again later.";
                        break;
                }
                throw new Error(errorMessage);
            }

            // 检查Content-Type是否为event-stream
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/event-stream")) {
                throw new Error("Response is not a valid event stream");
            }

            // 处理event-stream格式的数据流
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Failed to get response body reader");
            }

            return this.processStream(reader);
        } catch (error: any) {
            // 区分不同类型的错误
            if (error.name === "AbortError") {
                throw new Error("Request timeout");
            }
            // 重新抛出其他错误
            throw error;
        }
    }

    /**
     * 处理SSE流数据
     * @param reader - 流读取器
     * @returns 异步可迭代的响应流
     */
    private async *processStream(
        reader: ReadableStreamDefaultReader<Uint8Array>
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
            while (true) {
                const result = await reader.read();
                if (result.done) {
                    // 流正常结束，检查是否有未处理的数据
                    if (buffer.trim()) {
                        // 处理缓冲区中剩余的数据
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
                    break;
                }

                buffer += decoder.decode(result.value, { stream: true });
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
        } catch (error: any) {
            // 流处理过程中发生错误
            throw new Error(`Error processing stream: ${error.message}`);
        } finally {
            await reader.cancel();
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
        const url = `${this.baseUrl}/dialog/api/chat/config/getModelSeries`;

        const headers = {
            accept: "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "content-type": "application/json",
            priority: "u=1, i",
            "sec-ch-ua":
                '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            cookie: this.credentials.cookies || "",
        };

        const body = {
            configType: "MAIN_CHAT",
            interactionScene: "all_chat",
            version: "v1",
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch models: ${response.status} ${response.statusText}`
                );
            }

            const data = (await response.json()) as TongyiModelsResponse;
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
}