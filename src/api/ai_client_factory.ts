import { AIPlatformType, ClientCredentials } from "../types/ai_client_types";
import { AIPlatformClientInterface } from "../types/ai_client_types";
import { ChatGLMClient } from "./chatglm_client";
import { TongyiClient } from "./tongyi_client";
import { BaiduClient } from "./baidu_client";
import { DeepSeekClient } from "./deepseek_client";
import { QwenClient } from "./qwen_client";

/**
 * AI客户端工厂类
 * 根据平台类型创建对应的客户端实例
 */
export class AIClientFactory {
    /**
     * 创建AI客户端实例
     * @param platform - 平台类型
     * @param credentials - 认证信息
     * @returns 返回对应的客户端实例
     */
    static createClient(
        platform: AIPlatformType,
        credentials: ClientCredentials
    ): AIPlatformClientInterface {
        switch (platform) {
            case AIPlatformType.CHATGLM:
                return new ChatGLMClient(credentials);
            case AIPlatformType.TONGYI:
                return new TongyiClient(credentials);
            case AIPlatformType.BAIDU:
                return new BaiduClient(credentials);
            case AIPlatformType.DEEPSEEK:
                return new DeepSeekClient(credentials);
            case AIPlatformType.QWEN:
                return new QwenClient(credentials);
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}
