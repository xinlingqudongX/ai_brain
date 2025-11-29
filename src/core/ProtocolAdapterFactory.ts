/**
 * 协议适配器工厂
 * 负责创建和管理不同类型的协议适配器
 */

import { ProtocolAdapter, ProtocolType } from '../types/protocol';
import { HTTPAdapter } from '../adapters/HTTPAdapter';
import { WebSocketAdapter } from '../adapters/WebSocketAdapter';
import { SSEAdapter } from '../api/protocol/sse_adapter';
import { MockAdapter } from '../adapters/MockAdapter';

export class ProtocolAdapterFactory {
    private static instance: ProtocolAdapterFactory;
    private adapterRegistry = new Map<ProtocolType, new () => ProtocolAdapter>();

    private constructor() {
        this.registerDefaultAdapters();
    }

    /**
     * 获取单例实例
     */
    static getInstance(): ProtocolAdapterFactory {
        if (!ProtocolAdapterFactory.instance) {
            ProtocolAdapterFactory.instance = new ProtocolAdapterFactory();
        }
        return ProtocolAdapterFactory.instance;
    }

    /**
     * 注册默认适配器
     */
    private registerDefaultAdapters(): void {
        this.registerAdapter(ProtocolType.HTTP, HTTPAdapter);
        this.registerAdapter(ProtocolType.WEBSOCKET, WebSocketAdapter);
        this.registerAdapter(ProtocolType.SSE, SSEAdapter);
        this.registerAdapter(ProtocolType.MOCK, MockAdapter);
    }

    /**
     * 注册适配器
     */
    registerAdapter(type: ProtocolType, adapterClass: new () => ProtocolAdapter): void {
        this.adapterRegistry.set(type, adapterClass);
    }

    /**
     * 创建适配器
     */
    createAdapter(type: ProtocolType): ProtocolAdapter {
        const AdapterClass = this.adapterRegistry.get(type);
        if (!AdapterClass) {
            throw new Error(`Unsupported protocol type: ${type}`);
        }
        return new AdapterClass();
    }

    /**
     * 获取支持的协议类型
     */
    getSupportedProtocols(): ProtocolType[] {
        return Array.from(this.adapterRegistry.keys());
    }

    /**
     * 检查协议是否支持
     */
    isProtocolSupported(type: ProtocolType): boolean {
        return this.adapterRegistry.has(type);
    }
}