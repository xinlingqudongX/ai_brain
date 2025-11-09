/**
 * AI Brain - 多平台AI客户端集成系统
 * 
 * 该文件是项目的入口点，导出所有公共API
 */

// 导出类型定义
export type { 
  ClientCredentials, 
  SendMessageOptions, 
  AIPlatformClientInterface 
} from './types/ai_client_types.js';

// 导出枚举值
export { AIPlatformType } from './types/ai_client_types.js';

// 导出核心类
export { BaseAIClient } from './api/endpoints/base_ai_client.js';
export { AIClientFactory } from './api/endpoints/ai_client_factory.js';
export { UnifiedAIClient } from './api/endpoints/unified_ai_client.js';

// 导出客户端实现
export { ChatGLMClient } from './clients/chatglm_client.js';
export { TongyiClient } from './clients/tongyi_client.js';
export { BaiduClient } from './clients/baidu_client.js';
export { DeepSeekClient } from './clients/deepseek_client.js';
export { QwenClient } from './clients/qwen_client.js';

// 默认导出统一客户端
import { UnifiedAIClient } from './api/endpoints/unified_ai_client.js';
export default UnifiedAIClient;