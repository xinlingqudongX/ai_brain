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

    constructor(platform: AIPlatformType, credentials: ClientCredentials) {
        this.platform = platform;
        this.credentials = credentials;
    }

    /**
     * 发送消息给AI（抽象方法，需子类实现）
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    abstract sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>>;

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
}
