import { v4 as uuidv4 } from "uuid";

interface ChatGLMClientOptions {
    baseUrl?: string;
    platform?: string;
    deviceId?: string;
    authorization?: string;
    cookies?: string;
    model?: string;
    assistantId?: string;
}

export class ChatGLMUnifiedClient {
    private baseUrl: string;
    private platform: string;
    private deviceId: string;
    private authorization: string;
    private cookies: string;
    private model: string;
    private assistantId: string;

    constructor(options: ChatGLMClientOptions = {}) {
        this.baseUrl = options.baseUrl || "https://chatglm.cn/chatglm";
        this.platform = options.platform || "pc";
        this.deviceId = options.deviceId || this.generateDeviceId();
        this.authorization = options.authorization || "";
        this.cookies = options.cookies || "";
        this.model = options.model || "glm-4.5";
        this.assistantId = options.assistantId || "65940acff94777010aa6b796";
    }

    /**
     * 生成设备ID
     */
    private generateDeviceId(): string {
        return (uuidv4() + "").replace(/-/g, "");
    }

    /**
     * 生成时间戳相关的值
     */
    private generateTimestampValue(): string {
        const e = Date.now(),
            A = e.toString(),
            t = A.length,
            o = A.split("").map((e) => Number(e)),
            i = o.reduce((e, A) => e + A, 0) - o[t - 2],
            a = i % 10;
        return A.substring(0, t - 2) + a + A.substring(t - 1, t);
    }

    /**
     * 生成请求ID
     */
    private generateRequestId(): string {
        return (uuidv4() + "").replace(/-/g, "");
    }

    /**
     * 发送消息到ChatGLM
     * @param message - 用户发送的消息
     * @param conversationId - 会话ID（可选，不提供则创建新会话）
     * @returns 返回API响应
     */
    async sendMessage(
        message: string,
        conversationId?: string
    ): Promise<AsyncIterable<string>> {
        const url = `${this.baseUrl}/backend-api/assistant/stream`;

        // 如果没有提供conversationId，则生成一个
        if (!conversationId) {
            conversationId = this.generateRequestId();
        }

        const requestBody = {
            assistant_id: this.assistantId,
            conversation_id: conversationId,
            chat_type: "user_chat",
            meta_data: {
                cogview: {
                    rm_label_watermark: false,
                },
                is_test: false,
                input_question_type: "xxxx",
                channel: "",
                draft_id: "",
                is_networking: false,
                chat_mode: "zero",
                quote_log_id: "",
                platform: this.platform,
            },
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: message,
                        },
                    ],
                },
            ],
        };

        const headers: Record<string, string> = {
            accept: "text/event-stream",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "app-name": "chatglm",
            "content-type": "application/json",
            priority: "u=1, i",
            "sec-ch-ua":
                '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-fr": "default",
            "x-app-platform": this.platform,
            "x-app-version": "0.0.1",
            "x-device-brand": "",
            "x-device-id": this.deviceId,
            "x-device-model": "",
            "x-exp-groups":
                "na_android_config:exp:NA,na_4o_config:exp:4o_A,na_glm4plus_config:exp:open,mainchat_server_app:exp:A,mobile_history_daycheck:exp:a,desktop_toolbar:exp:A,chat_drawing_server:exp:A,drawing_server_cogview:exp:cogview4,app_welcome_v2:exp:B,chat_drawing_streamv2:exp:A,mainchat_rm_fc:exp:add,mainchat_dr:exp:open,chat_auto_entrance:exp:A,drawing_server_hi_dream:control:A,homepage_square:exp:close,assistant_recommend_prompt:exp:3,app_home_regular_user:exp:A,memory_common:exp:enable,mainchat_moe:exp:300,assistant_greet_user:exp:greet_user,app_welcome_personalize:exp:A,assistant_model_exp_group:exp:glm4.5,ai_wallet:exp:ai_wallet_enable",
            "x-lang": "zh",
            "x-nonce": this.generateRequestId(),
            "x-request-id": this.generateRequestId(),
            "x-sign": this.generateSign(),
            "x-timestamp": Date.now().toString(),
        };

        // 如果提供了authorization，则添加到请求头中
        if (this.authorization) {
            headers["authorization"] = this.authorization;
        }

        // 如果提供了cookies，则添加到请求头中
        if (this.cookies) {
            headers["cookie"] = this.cookies;
        }

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
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

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // 处理SSE数据
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.substring(6);
                            if (data.trim() !== "[DONE]") {
                                yield data;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error sending message:", error);
                throw error;
            }
        }

        return streamResponse();
    }

    /**
     * 获取用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        const url = `${this.baseUrl}/user-api/user/info`;

        const headers: Record<string, string> = {
            accept: "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "app-name": "chatglm",
            priority: "u=1, i",
            "sec-ch-ua":
                '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-fr": "default",
            "x-app-platform": this.platform,
            "x-app-version": "0.0.1",
            "x-device-brand": "",
            "x-device-id": this.deviceId,
            "x-device-model": "",
            "x-exp-groups":
                "na_android_config:exp:NA,na_4o_config:exp:4o_A,na_glm4plus_config:exp:open,mainchat_server_app:exp:A,mobile_history_daycheck:exp:a,desktop_toolbar:exp:A,chat_drawing_server:exp:A,drawing_server_cogview:exp:cogview4,app_welcome_v2:exp:B,chat_drawing_streamv2:exp:A,mainchat_rm_fc:exp:add,mainchat_dr:exp:open,chat_auto_entrance:exp:A,drawing_server_hi_dream:control:A,homepage_square:exp:close,assistant_recommend_prompt:exp:3,app_home_regular_user:exp:A,memory_common:exp:enable,mainchat_moe:exp:300,assistant_greet_user:exp:greet_user,app_welcome_personalize:exp:A,assistant_model_exp_group:exp:glm4.5,ai_wallet:exp:ai_wallet_enable",
            "x-lang": "zh",
            "x-nonce": this.generateRequestId(),
            "x-request-id": this.generateRequestId(),
            "x-sign": this.generateSign(),
            "x-timestamp": Date.now().toString(),
        };

        // 如果提供了authorization，则添加到请求头中
        if (this.authorization) {
            headers["authorization"] = this.authorization;
        }

        // 如果提供了cookies，则添加到请求头中
        if (this.cookies) {
            headers["cookie"] = this.cookies;
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error getting user info:", error);
            throw error;
        }
    }

    /**
     * 生成签名
     */
    private generateSign(): string {
        // 这里应该实现实际的签名算法
        // 目前返回一个固定的示例值
        return "e40df007ca6f16d174e110c7cb726ad5";
    }

    /**
     * 设置Authorization
     * @param token - Authorization token
     */
    setAuthorization(token: string): void {
        this.authorization = token;
    }

    /**
     * 设置Cookies
     * @param cookies - Cookies字符串
     */
    setCookies(cookies: string): void {
        this.cookies = cookies;
    }

    /**
     * 设置模型
     * @param model - 模型名称
     */
    setModel(model: string): void {
        this.model = model;
    }

    /**
     * 设置助手ID
     * @param assistantId - 助手ID
     */
    setAssistantId(assistantId: string): void {
        this.assistantId = assistantId;
    }

    /**
     * 从Cookies中提取Authorization Token
     */
    extractAuthorizationFromCookies(): string | null {
        if (!this.cookies) return null;

        const match = this.cookies.match(/chatglm_token=([^;]+)/);
        return match ? `Bearer ${match[1]}` : null;
    }

    /**
     * 从Cookies中提取用户ID
     */
    extractUserIdFromCookies(): string | null {
        if (!this.cookies) return null;

        const match = this.cookies.match(/chatglm_user_id=([^;]+)/);
        return match ? match[1] : null;
    }
}

// 如果在Node.js环境中使用，需要导出
if (typeof module !== "undefined" && module.exports) {
    module.exports = ChatGLMUnifiedClient;
}
