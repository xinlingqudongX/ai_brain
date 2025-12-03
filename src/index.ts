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
} from './types/ai_client_types';

// 导出枚举值
export { AIPlatformType } from './types/ai_client_types';

// 导出协议适配器相关
export type {
  ProtocolAdapter,
  ProtocolType,
  ConnectionConfig,
  UnifiedRequest,
  UnifiedResponse,
  StreamResponse,
  StreamEventType,
  ConnectionInfo,
  ErrorInfo,
  StreamMetadata,
  RetryOptions
} from './api/protocol';

export { SSEAdapter } from './api/protocol';
export { ProtocolAdapterFactory } from './api/protocol';

// 导出核心类
export { BaseAIClient } from './api/endpoints/base_ai_client';
export { AIClientFactory } from './api/endpoints/ai_client_factory';
export { UnifiedAIClient } from './api/endpoints/unified_ai_client';

// 导出客户端实现
export { ChatGLMClient } from './clients/chatglm_client';
export { TongyiClient } from './clients/tongyi_client';
export { BaiduClient } from './clients/baidu_client';
export { DeepSeekClient } from "./clients/deepseek_client";

// 默认导出统一客户端
import { UnifiedAIClient } from './api/endpoints/unified_ai_client';
export default UnifiedAIClient;