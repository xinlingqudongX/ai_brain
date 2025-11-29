/**
 * 协议适配器模块导出
 * 提供统一的协议适配器接口和实现
 */

// 类型定义
export * from './protocol_types';

// 具体实现
export { SSEAdapter } from './sse_adapter';

// 工厂类
export { ProtocolAdapterFactory } from './protocol_adapter_factory';