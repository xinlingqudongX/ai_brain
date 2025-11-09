import type {
    AIPlatformType,
    ClientCredentials,
    SendMessageOptions,
} from "../../types/ai_client_types";
import type { AIPlatformClientInterface } from "../../types/ai_client_types";
import { AIClientFactory } from "./ai_client_factory";

/**
 * 统一AI客户端
 * 提供统一的接口来使用不同的AI平台
 */
export class UnifiedAIClient {
    private client: AIPlatformClientInterface;
    private platform: AIPlatformType;
    private credentials: ClientCredentials;

    constructor(platform: AIPlatformType, credentials: ClientCredentials) {
        this.platform = platform;
        this.credentials = credentials;
        this.client = AIClientFactory.createClient(platform, credentials);
    }

    /**
     * 发送消息
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        return this.client.sendMessage(message, options);
    }

    /**
     * 获取用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        return this.client.getUserInfo();
    }

    /**
     * 设置认证信息
     * @param credentials - 认证信息
     */
    setCredentials(credentials: ClientCredentials): void {
        this.credentials = credentials;
        this.client.setCredentials(credentials);
    }

    /**
     * 从cookie中提取认证信息
     * @param cookies - cookie字符串
     * @returns 返回提取的认证信息或null
     */
    extractCredentialsFromCookies(cookies: string): ClientCredentials | null {
        // 这里需要根据当前平台类型来决定使用哪个客户端的提取方法
        // 为了简化，我们创建一个临时客户端来执行提取
        const tempClient = AIClientFactory.createClient(this.platform, {
            cookies,
        });
        return tempClient.extractCredentialsFromCookies(cookies);
    }

    /**
     * 切换平台
     * @param platform - 新的平台类型
     * @param credentials - 新的认证信息
     */
    switchPlatform(
        platform: AIPlatformType,
        credentials: ClientCredentials
    ): void {
        this.platform = platform;
        this.credentials = credentials;
        this.client = AIClientFactory.createClient(platform, credentials);
    }

    /**
     * 获取当前平台类型
     * @returns 返回当前平台类型
     */
    getPlatform(): AIPlatformType {
        return this.platform;
    }
}
