/**
 * 通义千问客户端函数
 * 用于与通义千问API进行通信
 */

interface TongyiClientOptions {
    baseUrl?: string;
    platform?: string;
    sessionId?: string;
    xsrfToken?: string;
    model?: string;
    cookies?: string;
}

export class TongyiClient {
    private baseUrl: string;
    private platform: string;
    private sessionId: string;
    private xsrfToken: string;
    private model: string;
    private cookies: string;

    constructor(options: TongyiClientOptions = {}) {
        this.baseUrl = options.baseUrl || "https://api.tongyi.com";
        this.platform = options.platform || "pc_tongyi";
        this.sessionId = options.sessionId || this.generateSessionId();
        this.xsrfToken = options.xsrfToken || "";
        this.model = options.model || "tongyi-qwen3-plus-model";
        this.cookies = options.cookies || "";
    }

    /**
     * 生成会话ID
     */
    private generateSessionId(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    /**
     * 发送消息到通义千问
     * @param message - 用户发送的消息
     * @param parentMsgId - 父消息ID（可选）
     * @returns 返回API响应
     */
    async sendMessage(
        message: string,
        parentMsgId: string | null = null
    ): Promise<string> {
        const url = `${this.baseUrl}/dialog/conversation`;

        // 如果没有提供parentMsgId，则生成一个
        if (!parentMsgId) {
            parentMsgId = this.generateRequestId();
        }

        const requestBody = {
            model: "",
            action: "next",
            mode: "chat",
            userAction: "chat",
            requestId: this.generateRequestId(),
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

        const headers: Record<string, string> = {
            "x-platform": this.platform,
            "content-type": "application/json",
            referer: "https://www.tongyi.com/qianwen",
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        };

        // 如果提供了xsrfToken，则添加到请求头中
        if (this.xsrfToken) {
            headers["x-xsrf-token"] = this.xsrfToken;
        }

        // 如果提供了cookies，则添加到请求头中
        if (this.cookies) {
            headers["cookie"] = this.cookies;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 检查response.body是否存在
            if (!response.body) {
                throw new Error("Response body is null");
            }

            // 由于API返回的是text/event-stream格式，我们需要逐行读取
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let result = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                result += chunk;

                // 处理SSE数据
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const jsonData = JSON.parse(line.substring(6));
                            // 这里可以处理实时返回的数据
                            console.log("Received data:", jsonData);
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            return result;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    /**
     * 设置XSRF Token
     * @param token - XSRF token
     */
    setXsrfToken(token: string): void {
        this.xsrfToken = token;
    }

    /**
     * 设置会话ID
     * @param sessionId - 会话ID
     */
    setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    /**
     * 设置Cookies
     * @param cookies - Cookies字符串
     */
    setCookies(cookies: string): void {
        this.cookies = cookies;
    }

    /**
     * 从Cookies中提取XSRF Token
     */
    extractXsrfTokenFromCookies(): string | null {
        if (!this.cookies) return null;

        const match = this.cookies.match(/XSRF-TOKEN=([^;]+)/);
        return match ? match[1] : null;
    }

    /**
     * 从Cookies中提取Session ID
     */
    extractSessionIdFromCookies(): string | null {
        if (!this.cookies) return null;

        const match = this.cookies.match(/SESSION=([^;]+)/);
        return match ? match[1] : null;
    }

    /**
     * 从页面HTML中提取XSRF Token
     * @param html - 页面HTML内容
     */
    extractXsrfTokenFromHtml(html: string): string | null {
        const match = html.match(/var csrfToken = "([^"]+)";/);
        return match ? match[1] : null;
    }

    /**
     * 从页面HTML中提取用户ID
     * @param html - 页面HTML内容
     */
    extractUserIdFromHtml(html: string): string | null {
        const match = html.match(/var empId = "([^"]+)";/);
        return match ? match[1] : null;
    }
}