import { ProtocolAdapter, AdapterConfig, ProtocolType } from '../types/protocol';
import { ProtocolAdapterFactory } from './ProtocolAdapterFactory';

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  healthCheckInterval: number;
  enableLoadBalancing: boolean;
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'random';
  enableHealthChecks: boolean;
}

/**
 * 连接信息
 */
interface ConnectionInfo {
  id: string;
  adapter: ProtocolAdapter;
  createdAt: Date;
  lastUsed: Date;
  activeRequests: number;
  isHealthy: boolean;
  lastHealthCheck: Date;
}

/**
 * 连接池统计信息
 */
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  unhealthyConnections: number;
  averageResponseTime: number;
  totalRequests: number;
  failedRequests: number;
}

/**
 * 连接池管理器
 * 负责管理多个协议适配器实例，提供连接复用和负载均衡
 */
export class ConnectionPoolManager {
  private connections = new Map<string, ConnectionInfo>();
  private config: Required<ConnectionPoolConfig>;
  private factory: ProtocolAdapterFactory;
  private stats = {
    totalRequests: 0,
    failedRequests: 0,
    responseTimes: [] as number[]
  };
  private healthCheckInterval?: NodeJS.Timeout;
  private connectionIndex = 0; // 用于轮询负载均衡

  constructor(
    factory: ProtocolAdapterFactory,
    config: Partial<ConnectionPoolConfig> = {}
  ) {
    this.factory = factory;
    this.config = {
      maxConnections: config.maxConnections ?? 10,
      idleTimeout: config.idleTimeout ?? 300000, // 5分钟
      connectionTimeout: config.connectionTimeout ?? 30000, // 30秒
      healthCheckInterval: config.healthCheckInterval ?? 30000, // 30秒
      enableLoadBalancing: config.enableLoadBalancing ?? true,
      loadBalancingStrategy: config.loadBalancingStrategy ?? 'round-robin',
      enableHealthChecks: config.enableHealthChecks ?? true
    };

    if (this.config.enableHealthChecks) {
      this.startHealthChecks();
    }

    this.log('Connection pool manager initialized');
  }

  /**
   * 获取连接
   */
  async getConnection(
    protocol: ProtocolType,
    config: AdapterConfig,
    connectionId?: string
  ): Promise<ProtocolAdapter> {
    // 如果指定了连接ID，尝试复用现有连接
    if (connectionId) {
      const existingConnection = this.connections.get(connectionId);
      
      if (existingConnection && existingConnection.isHealthy) {
        existingConnection.lastUsed = new Date();
        existingConnection.activeRequests++;
        this.log(`Reusing existing connection: ${connectionId}`);
        return existingConnection.adapter;
      }
    }

    // 清理无效连接
    await this.cleanupInvalidConnections();

    // 检查连接池是否已满
    if (this.connections.size >= this.config.maxConnections) {
      // 尝试获取一个空闲连接
      const availableConnection = await this.getAvailableConnection();
      
      if (availableConnection) {
        availableConnection.lastUsed = new Date();
        availableConnection.activeRequests++;
        this.log(`Reusing idle connection: ${availableConnection.id}`);
        return availableConnection.adapter;
      }
      
      throw new Error('Connection pool is full and no idle connections available');
    }

    // 创建新连接
    const newConnectionId = connectionId || this.generateConnectionId();
    
    try {
      const adapter = this.factory.createAdapter(protocol);

      const connectionInfo: ConnectionInfo = {
        id: newConnectionId,
        adapter,
        createdAt: new Date(),
        lastUsed: new Date(),
        activeRequests: 1,
        isHealthy: true,
        lastHealthCheck: new Date()
      };

      this.connections.set(newConnectionId, connectionInfo);
      this.log(`Created new connection: ${newConnectionId}`);
      
      return adapter;
    } catch (error) {
      this.log(`Failed to create connection: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * 释放连接
   */
  releaseConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    
    if (connection) {
      connection.activeRequests = Math.max(0, connection.activeRequests - 1);
      connection.lastUsed = new Date();
      
      if (connection.activeRequests === 0) {
        this.log(`Released connection: ${connectionId}`);
      }
    }
  }

  /**
   * 移除连接
   */
  async removeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    
    if (connection) {
      try {
        await connection.adapter.disconnect();
        this.connections.delete(connectionId);
        this.log(`Removed connection: ${connectionId}`);
      } catch (error) {
        this.log(`Error removing connection ${connectionId}: ${error}`, 'error');
        throw error;
      }
    }
  }

  /**
   * 获取可用的连接（负载均衡）
   */
  private async getAvailableConnection(): Promise<ConnectionInfo | null> {
    const healthyConnections = Array.from(this.connections.values())
      .filter(conn => conn.isHealthy && conn.activeRequests === 0);

    if (healthyConnections.length === 0) {
      return null;
    }

    switch (this.config.loadBalancingStrategy) {
      case 'round-robin':
        const connection = healthyConnections[this.connectionIndex % healthyConnections.length];
        this.connectionIndex = (this.connectionIndex + 1) % healthyConnections.length;
        return connection || null;

      case 'least-connections':
        return healthyConnections.reduce((min, current) =>
          current.activeRequests < min.activeRequests ? current : min
        );

      case 'random':
        return healthyConnections[Math.floor(Math.random() * healthyConnections.length)] || null;

      default:
        return healthyConnections[0] || null;
    }
  }

  /**
   * 清理无效连接
   */
  private async cleanupInvalidConnections(): Promise<void> {
    const now = Date.now();
    const connectionsToRemove: string[] = [];

    for (const [connectionId, connection] of this.connections) {
      // 检查是否超时
      const idleTime = now - connection.lastUsed.getTime();
      
      if (idleTime > this.config.idleTimeout && connection.activeRequests === 0) {
        connectionsToRemove.push(connectionId);
        continue;
      }

      // 检查健康状态
      if (!connection.isHealthy) {
        connectionsToRemove.push(connectionId);
        continue;
      }

      // 检查连接状态
      try {
        const isHealthy = connection.adapter.isConnected();
        if (!isHealthy) {
          connectionsToRemove.push(connectionId);
        }
      } catch (error) {
        this.log(`Health check failed for connection ${connectionId}: ${error}`, 'error');
        connectionsToRemove.push(connectionId);
      }
    }

    // 移除无效连接
    const cleanupPromises = connectionsToRemove.map(id => this.removeConnection(id));
    await Promise.allSettled(cleanupPromises);

    if (connectionsToRemove.length > 0) {
      this.log(`Cleaned up ${connectionsToRemove.length} invalid connections`);
    }
  }

  /**
   * 开始健康检查
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        this.log(`Health check error: ${error}`, 'error');
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * 执行健康检查
   */
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.connections.entries()).map(async ([connectionId, connection]) => {
      try {
        const isHealthy = connection.adapter.isConnected();
        connection.isHealthy = isHealthy;
        connection.lastHealthCheck = new Date();
        
        if (!isHealthy) {
          this.log(`Connection ${connectionId} is unhealthy`);
        }
      } catch (error) {
        connection.isHealthy = false;
        this.log(`Health check failed for connection ${connectionId}: ${error}`, 'error');
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * 获取统计信息
   */
  getStats(): PoolStats {
    const connections = Array.from(this.connections.values());
    
    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.activeRequests > 0).length,
      idleConnections: connections.filter(c => c.activeRequests === 0).length,
      unhealthyConnections: connections.filter(c => !c.isHealthy).length,
      averageResponseTime: this.calculateAverageResponseTime(),
      totalRequests: this.stats.totalRequests,
      failedRequests: this.stats.failedRequests
    };
  }

  /**
   * 记录请求
   */
  recordRequest(responseTime: number, success: boolean): void {
    this.stats.totalRequests++;
    
    if (!success) {
      this.stats.failedRequests++;
    }
    
    // 保持响应时间数组的大小
    this.stats.responseTimes.push(responseTime);
    if (this.stats.responseTimes.length > 1000) {
      this.stats.responseTimes.shift();
    }
  }

  /**
   * 计算平均响应时间
   */
  private calculateAverageResponseTime(): number {
    if (this.stats.responseTimes.length === 0) {
      return 0;
    }
    
    const sum = this.stats.responseTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / this.stats.responseTimes.length);
  }

  /**
   * 销毁连接池
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined as any;
    }

    // 断开所有连接
    const disconnectPromises = Array.from(this.connections.keys()).map(id =>
      this.removeConnection(id).catch(error => {
        this.log(`Error destroying connection ${id}: ${error}`, 'error');
      })
    );

    await Promise.allSettled(disconnectPromises);
    this.connections.clear();
    
    this.log('Connection pool manager destroyed');
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 日志记录
   */
  private log(message: string, level: 'info' | 'error' | 'warn' = 'info'): void {
    const factoryConfig = { maxConnections: 10, enableLogging: true }; // 简化配置
      if (!factoryConfig.enableLogging) return;
    
    const timestamp = new Date().toISOString();
    console[level](`[ConnectionPoolManager ${timestamp}] ${message}`);
  }
}