import type { ClientCredentials } from "../../types/ai_client_types.js";
import type { AIPlatformClientInterface } from "../../types/ai_client_types.js";
import { AIPlatformType } from "../../types/ai_client_types.js";
import { ChatGLMClient } from "../../clients/chatglm_client.js";
import { TongyiClient } from "../../clients/tongyi_client.js";
import { BaiduClient } from "../../clients/baidu_client.js";
import { DeepSeekClient } from "../../clients/deepseek_client.js";
import { QwenClient } from "../../clients/qwen_client.js";

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
