/**
 * AI平台类型枚举
 */
export const AIPlatformType = {
    CHATGLM: "chatglm",
    TONGYI: "tongyi",
    BAIDU: "baidu",
    DEEPSEEK: "deepseek",
    QWEN: "qwen",
} as const;
export type AIPlatformType =
    (typeof AIPlatformType)[keyof typeof AIPlatformType];

/**
 * 客户端认证信息接口
 */
export interface ClientCredentials {
    cookies: string;
    [key: string]: any; // 平台特定的认证字段
}

/**
 * 消息发送选项
 */
export interface SendMessageOptions {
    conversationId?: string;
    parentId?: string;
    timeout?: number;
    [key: string]: any; // 平台特定的选项
}

/**
 * AI平台客户端接口
 */
export interface AIPlatformClientInterface {
    baseUrl: string; // 平台API的基础URL
    
    /**
     * 创建会话
     * @returns 返回会话ID
     */
    createSession(): Promise<string>;
    
    /**
     * 删除会话
     * @param sessionId - 会话ID
     */
    deleteSession(sessionId: string): Promise<void>;

    /**
     * 发送消息给AI
     * 注意：在发送消息前，必须确认模型已经选择（如果平台支持模型选择）
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

    /**
     * 发送系统消息
     * @param message - 要发送的系统消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    sendSystemMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

    /**
     * 发送带深度思考的消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    sendDeepThinkMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

    /**
     * 发送不联网搜索的消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    sendOfflineMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

    /**
     * 获取用户信息
     * @returns 返回用户信息
     */
    getUserInfo(): Promise<any>;

    /**
     * 设置认证信息
     * @param credentials - 认证信息
     */
    setCredentials(credentials: ClientCredentials): void;

    /**
     * 从cookie中提取认证信息
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    extractCredentialsFromCookies(cookies: string): ClientCredentials | null;

    /**
     * 选择模型
     * @param model - 模型标识
     * @returns 是否选择成功
     */
    selectModel(model: string): Promise<boolean>;

    /**
     * 获取当前模型
     * @returns 当前模型标识
     */
    getCurrentModel(): string;

    /**
     * 获取可用模型列表
     * @returns 可用模型列表
     */
    getAvailableModels(): Promise<string[]>;
}