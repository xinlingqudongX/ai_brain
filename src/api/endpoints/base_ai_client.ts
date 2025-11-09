import {
    AIPlatformClientInterface,
    ClientCredentials,
    SendMessageOptions,
    AIPlatformType,
} from "../../types/ai_client_types";

/**
 * 基础AI客户端抽象类
 * 实现所有AI客户端的通用功能
 */
export abstract class BaseAIClient implements AIPlatformClientInterface {
    protected credentials: ClientCredentials;
    protected platform: AIPlatformType;
    public baseUrl: string = "";
    public sessionID: string = '';
    
    constructor(platform: AIPlatformType, credentials: ClientCredentials) {
        this.platform = platform;
        this.credentials = credentials;
    }

    /**
     * 发送消息给AI（抽象方法，需子类实现）
     * 注意：在发送消息前，必须确认模型已经选择（如果平台支持模型选择）
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    abstract sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

    /**
     * 发送系统消息（通用实现，子类可以覆盖）
     * @param message - 要发送的系统消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendSystemMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        // 默认实现，子类可以覆盖
        return this.sendMessage(message, options);
    }

    /**
     * 发送带深度思考的消息（通用实现，子类可以覆盖）
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendDeepThinkMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        // 默认实现，子类可以覆盖
        return this.sendMessage(message, options);
    }

    /**
     * 发送不联网搜索的消息（通用实现，子类可以覆盖）
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendOfflineMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        // 默认实现，子类可以覆盖
        return this.sendMessage(message, options);
    }

    /**
     * 获取用户信息（抽象方法，需子类实现）
     * @returns 返回用户信息
     */
    abstract getUserInfo(): Promise<any>;

    /**
     * 设置认证信息
     * @param credentials - 认证信息
     */
    setCredentials(credentials: ClientCredentials): void {
        this.credentials = credentials;
    }

    /**
     * 从cookie中提取认证信息（抽象方法，需子类实现）
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    abstract extractCredentialsFromCookies(
        cookies: string
    ): ClientCredentials | null;

    /**
     * 生成UUID
     * @returns 返回生成的UUID
     */
    protected generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    /**
     * 生成时间戳
     * @returns 返回当前时间戳字符串
     */
    protected generateTimestamp(): string {
        return Date.now().toString();
    }

    /**
     * 创建会话（通用实现）
     * @returns 返回会话ID
     */
    async createSession(): Promise<string> {
        // 默认实现，子类可以覆盖
        this.sessionID = this.generateUUID();
        return this.sessionID;
    }

    /**
     * 删除会话（通用实现）
     * @param sessionId - 会话ID
     */
    async deleteSession(sessionId: string): Promise<void> {
        // 默认实现，子类可以覆盖
        if (sessionId === this.sessionID) {
            this.sessionID = '';
        }
    }

    /**
     * 选择模型（通用实现，子类可以覆盖）
     * @param model - 模型标识
     * @returns 是否选择成功
     */
    async selectModel(model: string): Promise<boolean> {
        // 默认实现，子类可以覆盖具体的模型选择逻辑
        console.log(`Selected model: ${model} for platform: ${this.platform}`);
        return true;
    }

    /**
     * 获取当前模型（通用实现，子类可以覆盖）
     * @returns 当前模型标识
     */
    getCurrentModel(): string {
        // 默认实现，子类可以覆盖
        return "";
    }

    /**
     * 获取可用模型列表（通用实现，子类可以覆盖）
     * @returns 可用模型列表
     */
    async getAvailableModels(): Promise<string[]> {
        // 默认实现，子类可以覆盖
        return [];
    }
}