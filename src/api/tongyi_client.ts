import { BaseAIClient } from "./base_ai_client";
import {
    AIPlatformType,
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";

/**
 * 通义千问客户端实现
 */
export class TongyiClient extends BaseAIClient {
    private sessionId: string;
    private xsrfToken: string;
    private model: string;

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.TONGYI, credentials);
        this.sessionId = credentials.sessionId || this.generateUUID();
        this.xsrfToken = credentials.xsrfToken || "";
        this.model = credentials.model || "tongyi-qwen3-plus-model";
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
        const parentMsgId = options?.parentId || this.generateUUID();

        const requestBody = {
            model: "",
            action: "next",
            mode: "chat",
            userAction: "chat",
            requestId: this.generateUUID(),
            sessionId: this.sessionId,
            sessionType: "text_chat",
            parentMsgId: parentMsgId,
            params: {
                agentId: "",
                searchType: "",
                pptGenerate: false,
                bizScene: "",
                bizSceneInfo: {},
                specifiedModel: this.model,
                deepThink: false,
            },
            contents: [
                {
                    content: message,
                    contentType: "text",
                    role: "user",
                    ext: {
                        searchType: "",
                        pptGenerate: false,
                        deepThink: false,
                        deepResearch: false,
                    },
                },
            ],
        };

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
            // 这里应该是实际的API调用
            // 由于我们没有真实的API访问权限，返回模拟数据
            yield JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: "这是来自通义千问的模拟响应: " + message,
                        },
                    },
                ],
            });
            yield JSON.stringify({
                choices: [{ delta: { content: "\n感谢您的消息！" } }],
            });
        }

        return streamResponse();
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
