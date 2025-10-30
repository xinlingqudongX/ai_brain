/**
 * AI平台类型枚举
 */
export enum AIPlatformType {
    CHATGLM = "chatglm",
    TONGYI = "tongyi",
    BAIDU = "baidu",
    DEEPSEEK = "deepseek",
    QWEN = "qwen",
}

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
    [key: string]: any; // 平台特定的选项
}

/**
 * AI平台客户端接口
 */
export interface AIPlatformClientInterface {
    /**
     * 发送消息给AI
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    sendMessage(
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
}
