/**
 * 协议适配器工厂
 * 负责创建和管理不同类型的协议适配器
 */

import { ProtocolAdapter, ProtocolType, AIPlatformType } from './protocol_types';
import { SSEAdapter } from './sse_adapter';

export class ProtocolAdapterFactory {
    private static adapters = new Map<ProtocolType, new () => ProtocolAdapter>();
    
    static {
        // 注册默认适配器
        this.registerAdapter(ProtocolType.SSE, SSEAdapter);
        // 这里可以注册其他适配器，如WebSocketAdapter、HTTPAdapter、MockAdapter等
    }

    /**
     * 注册适配器
     * @param type - 协议类型
     * @param adapterClass - 适配器类
     */
    static registerAdapter(type: ProtocolType, adapterClass: new () => ProtocolAdapter): void {
        this.adapters.set(type, adapterClass);
    }

    /**
     * 创建适配器
     * @param type - 协议类型
     * @returns 协议适配器实例
     */
    static createAdapter(type: ProtocolType): ProtocolAdapter {
        const AdapterClass = this.adapters.get(type);
        if (!AdapterClass) {
            throw new Error(`Unsupported protocol type: ${type}`);
        }
        return new AdapterClass();
    }

    /**
     * 为特定AI平台创建适配器
     * @param platform - AI平台类型
     * @returns 协议适配器实例
     */
    static createAdapterForPlatform(platform: AIPlatformType): ProtocolAdapter {
        const protocolMap: Record<AIPlatformType, ProtocolType> = {
            [AIPlatformType.QWEN]: ProtocolType.SSE,
            [AIPlatformType.BAIDU]: ProtocolType.SSE,
            [AIPlatformType.CHATGLM]: ProtocolType.SSE,
            [AIPlatformType.DEEPSEEK]: ProtocolType.SSE,
            [AIPlatformType.TONGYI]: ProtocolType.SSE
        };

        const protocolType = protocolMap[platform] || ProtocolType.SSE;
        return this.createAdapter(protocolType);
    }

    /**
     * 获取支持的协议类型
     * @returns 支持的协议类型列表
     */
    static getSupportedProtocols(): ProtocolType[] {
        return Array.from(this.adapters.keys());
    }

    /**
     * 检查协议是否支持
     * @param type - 协议类型
     * @returns 是否支持
     */
    static isProtocolSupported(type: ProtocolType): boolean {
        return this.adapters.has(type);
    }
}