/**
 * 协议适配器管理器
 * 统一管理不同类型的协议适配器，提供统一的接口
 */

import { ProtocolAdapter, UnifiedRequest, UnifiedResponse, StreamResponse } from './protocol_types';

export class ProtocolAdapterManager {
    private adapter: ProtocolAdapter | null = null;

    /**
     * 设置协议适配器
     * @param adapter - 协议适配器实例
     */
    setAdapter(adapter: ProtocolAdapter): void {
        this.adapter = adapter;
    }

    /**
     * 获取当前协议适配器
     * @returns 当前协议适配器
     */
    getAdapter(): ProtocolAdapter {
        if (!this.adapter) {
            throw new Error('No protocol adapter set. Please call setAdapter() first.');
        }
        return this.adapter;
    }

    /**
     * 连接到服务
     * @param config - 连接配置
     */
    async connect(config: any): Promise<void> {
        return this.getAdapter().connect(config);
    }

    /**
     * 发送流式请求
     * @param request - 统一请求对象
     */
    async *sendStream(request: UnifiedRequest): AsyncIterable<StreamResponse> {
        yield* this.getAdapter().sendStream(request);
    }

    /**
     * 发送普通请求
     * @param request - 统一请求对象
     */
    async send(request: UnifiedRequest): Promise<UnifiedResponse> {
        return this.getAdapter().send(request);
    }

    /**
     * 断开连接
     */
    async disconnect(): Promise<void> {
        return this.getAdapter().disconnect();
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.getAdapter().isConnected();
    }

    /**
     * 获取连接信息
     */
    getConnectionInfo(): any {
        return this.getAdapter().getConnectionInfo();
    }

    /**
     * 获取当前协议类型
     */
    getProtocolType(): string {
        return this.getAdapter().protocolType;
    }
}