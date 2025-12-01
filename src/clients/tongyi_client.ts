import axios, { AxiosInstance } from "axios";
import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type {
    TongyiModelsResponse,
    TongyiConversationRequest,
    TongyiMessageContent,
    TongyiSessionParams,
    TongyiLoginStatusResponse,
} from "../types/tongyi_types";
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

    private sessionParams = {
        deepThink: false,
        parentMsgId: "",
        requestId: "",
        sessionId: "",
    };

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.TONGYI, credentials);
        // this.sessionID = credentials.sessionId || this.generateUUID();
        this.xsrfToken = credentials.xsrfToken || "";
        this.model = credentials.model || "tongyi-qwen3-plus-model";

        // 创建 axios 实例并设置默认配置
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "sec-ch-ua":
                    '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-platform": "pc_tongyi",
                "x-tw-from": "tongyi",
            },
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
     * @param options - 发送选项，其中stream为false时返回完整字符串，为true时返回流
     * @returns 如果options.stream为true则返回异步可迭代的响应流，否则返回完整响应字符串
     */
    async sendMessage(
        message: string,
        options: SendMessageOptions & { stream: true }
    ): Promise<AsyncIterable<string>>;
    async sendMessage(
        message: string,
        options?: SendMessageOptions & { stream?: false }
    ): Promise<string>;
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string> | string> {
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
        const result = await this.sendTongyiMessage(message, {
            ...options,
            messageType: "system",
        });
        // 如果返回的是字符串，将其包装成一个只产生一次值的异步迭代器
        if (typeof result === "string") {
            async function* stringToIterator(
                str: string
            ): AsyncIterable<string> {
                yield str;
            }
            return stringToIterator(result);
        }
        return result;
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
        const result = await this.sendTongyiMessage(message, {
            ...options,
            deepThink: true,
        });
        // 如果返回的是字符串，将其包装成一个只产生一次值的异步迭代器
        if (typeof result === "string") {
            async function* stringToIterator(
                str: string
            ): AsyncIterable<string> {
                yield str;
            }
            return stringToIterator(result);
        }
        return result;
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
        const result = await this.sendTongyiMessage(message, {
            ...options,
            searchType: "off",
        });
        // 如果返回的是字符串，将其包装成一个只产生一次值的异步迭代器
        if (typeof result === "string") {
            async function* stringToIterator(
                str: string
            ): AsyncIterable<string> {
                yield str;
            }
            return stringToIterator(result);
        }
        return result;
    }

    /**
     * 发送通义千问消息的内部实现
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 如果options.stream为true则返回异步可迭代的响应流，否则返回完整响应字符串
     */
    private async sendTongyiMessage(
        message: string,
        options?: SendMessageOptions & {
            messageType?: string;
            deepThink?: boolean;
            searchType?: string;
        }
    ): Promise<AsyncIterable<string> | string> {
        // 确认模型已经选择
        if (!this.model) {
            throw new Error(
                "Model not selected. Please select a model before sending messages."
            );
        }

        const timeout = options?.timeout || 30000; // 默认30秒超时
        const stream = options?.stream !== false; // 默认启用流式传输

        // 构建基础消息内容
        const messageContent: TongyiMessageContent = {
            content: message,
            contentType: "text",
            role: options?.messageType === "system" ? "system" : "user",
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
            bizSceneInfo: {},
        };

        // 如果启用了深度思考，添加相应参数
        if (options?.deepThink) {
            sessionParams.deepThink = true;
        }

        // 如果设置了搜索类型，添加相应参数
        if (options?.searchType) {
            sessionParams.searchType = options.searchType;
        }
        if (!this.sessionParams.requestId) {
            this.sessionParams.requestId = this.generateUUID();
        }

        // 构建请求体，使用明确定义的类型
        const requestBody: TongyiConversationRequest = {
            action: "next",
            actionSource: "",
            contents: [messageContent],
            mode: "chat",
            model: "", // 模型在params中指定
            params: sessionParams,
            parentMsgId: this.sessionParams.parentMsgId,
            requestId: this.sessionParams.requestId,
            sessionId: this.sessionParams.sessionId,
            sessionType: "text_chat",
            userAction: "new_top",
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
                    responseType: "stream",
                    validateStatus: (status_code) => true,
                }
            );

            // 当返回状态码不是 200 时，尝试读取错误信息并抛出更明确的错误
            if (response.status !== 200) {
                const contentType = response.headers["content-type"] || "";
                let errorDetail = `status=${response.status}`;

                try {
                    // 尝试从响应体中提取错误内容（无论是文本还是 JSON）
                    const bodyText = await this.collectStreamText(
                        response.data
                    );
                    if (contentType.includes("application/json")) {
                        try {
                            const json = JSON.parse(bodyText);
                            const code = json.errorCode || json.code;
                            const msg =
                                json.message ||
                                json.msg ||
                                json.errorMsg ||
                                json.error ||
                                json.reason;
                            errorDetail += code ? `, errorCode=${code}` : "";
                            errorDetail += msg ? `, message=${msg}` : "";
                        } catch {
                            errorDetail += bodyText
                                ? `, body=${bodyText.slice(0, 200)}`
                                : "";
                        }
                    } else {
                        errorDetail += bodyText
                            ? `, body=${bodyText.slice(0, 200)}`
                            : "";
                    }
                } catch {
                    // 忽略解析错误，保留基础状态码信息
                }

                throw new Error(`Tongyi request failed: ${errorDetail}`);
            }

            // 检查Content-Type是否为event-stream
            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.includes("text/event-stream")) {
                throw new Error("Response is not a valid event stream");
            }

            // 处理event-stream格式的数据流
            const responseData = response.data;

            // 如果不启用流式传输，收集完整响应并返回字符串
            if (!stream) {
                let fullResponse = "";
                const streamProcessor = this.processStream(responseData);
                for await (const chunk of streamProcessor) {
                    fullResponse = chunk;
                }
                return fullResponse;
            }

            // 否则返回流处理器
            return this.processStream(responseData);
        } catch (error: any) {
            // 区分不同类型的错误
            if (error.code === "ECONNABORTED") {
                throw new Error("Request timeout");
            }
            // 对非 200 响应的错误进行更清晰的处理
            if (error.response) {
                const status = error.response.status;
                const contentType =
                    error.response.headers?.["content-type"] || "";
                let detail = `status=${status}`;
                try {
                    const bodyText = await this.collectStreamText(
                        error.response.data
                    );
                    if (contentType.includes("application/json")) {
                        try {
                            const json = JSON.parse(bodyText);
                            const code = json.errorCode || json.code;
                            const msg =
                                json.message ||
                                json.msg ||
                                json.errorMsg ||
                                json.error ||
                                json.reason;
                            detail += code ? `, errorCode=${code}` : "";
                            detail += msg ? `, message=${msg}` : "";
                        } catch {
                            detail += bodyText
                                ? `, body=${bodyText.slice(0, 200)}`
                                : "";
                        }
                    } else {
                        detail += bodyText
                            ? `, body=${bodyText.slice(0, 200)}`
                            : "";
                    }
                } catch {}
                throw new Error(`Tongyi request failed: ${detail}`);
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
    private async *processStream(stream: any): AsyncIterable<string> {
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        // 定义事件类型常量
        const EVENT_TYPES = {
            DATA: "data: ",
            ERROR: "error ",
            DONE: "data: [DONE]",
        } as const;

        try {
            for await (const chunk of stream) {
                const text = decoder.decode(chunk, { stream: true });
                buffer += text;

                // 按行处理缓冲区中的数据
                let lines = buffer.split("\n");
                // 保留最后一行在缓冲区中，因为它可能不完整
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine === EVENT_TYPES.DONE) {
                        return; // 结束流处理
                    } else if (trimmedLine.startsWith(EVENT_TYPES.DATA)) {
                        const dataPayload = trimmedLine.slice(
                            EVENT_TYPES.DATA.length
                        );
                        // 只有当数据不为空时才处理
                        if (dataPayload.trim()) {
                            yield * this.parseStreamData(dataPayload);
                        }
                    } else if (trimmedLine.startsWith(EVENT_TYPES.ERROR)) {
                        throw new Error(
                            `Error received from server: ${trimmedLine.slice(
                                EVENT_TYPES.ERROR.length
                            )}`
                        );
                    }
                }
            }

            // 处理最后可能剩余的不完整行
            if (buffer.trim()) {
                const trimmedBuffer = buffer.trim();
                if (trimmedBuffer === EVENT_TYPES.DONE) {
                    return;
                } else if (trimmedBuffer.startsWith(EVENT_TYPES.DATA)) {
                    const dataPayload = trimmedBuffer.slice(
                        EVENT_TYPES.DATA.length
                    );
                    // 只有当数据不为空时才处理
                    if (dataPayload.trim()) {
                        yield * this.parseStreamData(dataPayload);
                    }
                } else if (trimmedBuffer.startsWith(EVENT_TYPES.ERROR)) {
                    throw new Error(
                        `Error received from server: ${trimmedBuffer.slice(
                            EVENT_TYPES.ERROR.length
                        )}`
                    );
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
        let parsedData: TongyiAIResponse;
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            // 如果解析失败，记录警告但不中断流处理
            console.warn("Failed to parse stream data:", data);
            return;
        }

        // 更新会话参数
        if (parsedData.msgId) {
            this.sessionParams.parentMsgId = parsedData.msgId;
        }
        if (parsedData.sessionId) {
            this.sessionParams.sessionId = parsedData.sessionId;
        }

        // 处理内容
        if (!parsedData.contents || parsedData.contents.length === 0) {
            yield "";
        } else {
            const [reply, ...other] = parsedData.contents;
            if (other.length > 0) {
                console.log("其他返回", other);
            }
            yield parsedData.contents.at(0)?.content || "";
        }
    }

    /**
     * 读取任意响应体（可能是 Node.js Readable 或其他可迭代流）为字符串
     */
    private async collectStreamText(stream: any): Promise<string> {
        if (!stream) return "";
        const decoder = new TextDecoder("utf-8");
        let out = "";
        try {
            // axios 在 responseType=stream 下返回一个可异步迭代的流
            for await (const chunk of stream) {
                out += decoder.decode(chunk, { stream: true });
                if (out.length > 1024 * 1024) break; // 最多读取 1MB，防止过大
            }
        } catch {
            // 如果不是异步迭代流，尝试直接读取 toString
            try {
                if (typeof stream === "string") return stream;
                if (typeof stream?.toString === "function")
                    return stream.toString();
            } catch {}
        }
        return out;
    }

    /**
     * 检查对象是否为TongyiAIResponse类型
     * @param obj - 要检查的对象
     * @returns 是否为TongyiAIResponse类型
     */
    private isTongyiAIResponse(obj: any): obj is TongyiAIResponse {
        return (
            typeof obj === "object" &&
            obj !== null &&
            "aiDisclaimer" in obj &&
            "canFeedback" in obj &&
            "canRegenerate" in obj &&
            "canShare" in obj &&
            "canShow" in obj &&
            "extraType" in obj &&
            "incremental" in obj &&
            "msgStatus" in obj &&
            "passValue" in obj &&
            "sessionOpen" in obj &&
            "sessionShare" in obj &&
            "sessionWarnNew" in obj &&
            "webSearch" in obj &&
            ("contents" in obj || "content" in obj)
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
                },
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
            const modelExists = models.data.some((series) =>
                series.params.some((param) => param.modelCode === modelCode)
            );

            if (!modelExists) {
                throw new Error(`Model ${modelCode} not found`);
            }

            // 设置当前模型
            this.model = modelCode;
            return true;
        } catch (error: any) {
            console.error(
                `Failed to select model ${modelCode}:`,
                error.message
            );
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

            models.data.forEach((series) => {
                series.params.forEach((param) => {
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
    async checkLoginStatus(): Promise<{
        isLoggedIn: boolean;
        userInfo?: TongyiLoginStatusResponse["data"];
    }> {
        const url = `/assistant/api/user/info/get?isLogin&c=tongyi-web`;

        try {
            const response = await this.httpClient.get(url, {
                headers: {
                    accept: "application/json, text/plain, */*",
                    priority: "u=1, i",
                },
            });

            const data: TongyiLoginStatusResponse = response.data;

            // 根据响应数据判断登录状态
            // 如果返回了用户信息，则认为已登录
            if (data.success && data.data && data.data.userId) {
                return {
                    isLoggedIn: true,
                    userInfo: data.data,
                };
            }

            return { isLoggedIn: false };
        } catch (error: any) {
            console.error("Failed to check login status:", error.message);
            return { isLoggedIn: false };
        }
    }
}
