import { BaseAIClient } from "../api/endpoints/base_ai_client";
import type {
    ClientCredentials,
    SendMessageOptions,
} from "../types/ai_client_types";
import { AIPlatformType } from "../types/ai_client_types";

/**
 * 百度客户端实现
 */
export class BaiduClient extends BaseAIClient {
    public baseUrl: string = "https://yiyan.baidu.com/eb";

    constructor(credentials: ClientCredentials) {
        super(AIPlatformType.BAIDU, credentials);
    }

    /** 聊天会话 */
    public async conversation() {
        const res = await fetch(`${this.baseUrl}/chatflow/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 添加百度特定的认证头
                "Cookie": this.credentials.cookies,
            },
            body: JSON.stringify({
                chat_params: {
                    chat_token: this.generateChatToken(),
                },
            }),
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch conversation: ${res.status} ${res.statusText}`);
        }

        // 处理event-stream格式的数据流
        const reader = res.body?.getReader();
        if (!reader) {
            throw new Error("Failed to get response body reader");
        }

        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        return {
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        try {
                            const { done, value } = await reader.read();
                            if (done) {
                                return { done: true, value: undefined };
                            }

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split("\n");
                            buffer = lines.pop() || "";

                            for (const line of lines) {
                                if (line.startsWith("data: ")) {
                                    const data = line.slice(6);
                                    if (data === "[DONE]") {
                                        return { done: true, value: undefined };
                                    }
                                    try {
                                        return { done: false, value: JSON.parse(data) };
                                    } catch (e) {
                                        // 忽略无法解析的行
                                    }
                                }
                            }

                            return { done: false, value: undefined };
                        } catch (error) {
                            throw error;
                        }
                    },
                    async return() {
                        await reader.cancel();
                        return { done: true, value: undefined };
                    },
                    async throw(error: any) {
                        await reader.cancel();
                        throw error;
                    }
                };
            }
        };
    }

    /**
     * 发送消息给百度AI
     * @param message - 要发送的消息
     * @param options - 发送选项
     * @returns 返回异步可迭代的响应流
     */
    async sendMessage(
        message: string,
        options?: SendMessageOptions
    ): Promise<AsyncIterable<string>> {
        // 构建请求体
        const requestBody = {
            message: {
                inputMethod: "chat_search",
                isRebuild: false,
                content: {
                    query: message,
                    agentInfo: {
                        agent_id: [""],
                        params: '{"agt_rk":1,"agt_sess_cnt":1}',
                    },
                    agentInfoList: [],
                    qtype: 0,
                    aitab_ct: "",
                },
                searchInfo: {
                    srcid: "",
                    order: "",
                    tplname: "",
                    dqaKey: "",
                    re_rank: "1",
                    ori_lid: "",
                    sa: "bkb",
                    enter_type: "ai_tab_url",
                    chatParams: {
                        setype: "csaitab",
                        chat_samples: "WISE_NEW_CSAITAB",
                        chat_token: this.generateChatToken(),
                        scene: "",
                    },
                    blockCmpt: [],
                    usedModel: {
                        modelName: "DeepSeek-R1",
                        modelFunction: {
                            deepSearch: "0",
                            internetSearch: "0",
                        },
                    },
                    landingPageSwitch: "",
                    landingPage: "aitab",
                    ecomFrom: "",
                    isInnovate: 2,
                    applid: "",
                    a_lid: "",
                    out_enter_type: "",
                    showMindMap: false,
                },
                from: "",
                source: "pc_csaitab",
                query: [
                    {
                        type: "TEXT",
                        data: {
                            text: {
                                query: message,
                                extData: "{}",
                                text_type: "",
                            },
                        },
                    },
                ],
                anti_ext: {
                    inputT: null,
                    ck1: 10952,
                    ck9: 1117,
                    ck10: 229,
                },
            },
            setype: "csaitab",
            rank: 1,
        };

        // 创建一个异步生成器来处理SSE流
        async function* streamResponse(): AsyncIterable<string> {
            // 这里应该是实际的API调用
            // 由于我们没有真实的API访问权限，返回模拟数据
            yield JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: "这是来自百度AI的模拟响应: " + message,
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
     * 获取百度用户信息
     * @returns 返回用户信息
     */
    async getUserInfo(): Promise<any> {
        // 模拟用户信息响应
        return {
            user_id: "baidu_user_123456",
            username: "百度用户",
            platform: "baidu",
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

        // 百度使用多个cookie字段
        const baiduIdMatch =
            cookies.match(/BAIDUID=([^;]+)/) ||
            cookies.match(/BAIDUID_BFESS=([^;]+)/);
        const bdussMatch =
            cookies.match(/BDUSS=([^;]+)/) ||
            cookies.match(/BDUSS_BFESS=([^;]+)/);

        if (!baiduIdMatch && !bdussMatch) {
            return null;
        }

        return {
            cookies,
            baiduId: baiduIdMatch ? baiduIdMatch[1] : "",
            bduss: bdussMatch ? bdussMatch[1] : "",
        };
    }

    /**
     * 生成聊天token
     * @returns 返回生成的聊天token
     */
    private generateChatToken(): string {
        const randomPart1 = this.generateUUID()
            .replace(/-/g, "")
            .substring(0, 24);
        const randomPart2 = this.generateUUID()
            .replace(/-/g, "")
            .substring(0, 32);
        const timestamp = Date.now();
        const randomPart3 = Math.floor(Math.random() * 10000000000000000000);

        return `${randomPart1}|${randomPart2}|${timestamp}|${randomPart3}-${randomPart3}-3`;
    }
}