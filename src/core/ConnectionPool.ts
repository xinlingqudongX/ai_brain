import { EventEmitter } from 'events';

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
  /** 最大连接数 */
  maxConnections: number;
  /** 最小连接数 */
  minConnections: number;
  /** 空闲超时时间（毫秒） */
  idleTimeout: number;
  /** 连接生命周期（毫秒） */
  connectionLifetime: number;
}

/**
 * 连接池统计信息
 */
export interface PoolStats {
  /** 总连接数 */
  totalConnections: number;
  /** 可用连接数 */
  availableConnections: number;
  /** 活跃连接数 */
  activeConnections: number;
  /** 等待队列长度 */
  waitingQueueLength: number;
  /** 创建连接数 */
  connectionsCreated: number;
  /** 销毁连接数 */
  connectionsDestroyed: number;
  /** 平均等待时间（毫秒） */
  averageWaitTime: number;
  /** 平均使用时间（毫秒） */
  averageUseTime: number;
}

/**
 * 连接池事件
 */
export interface PoolEvents {
  /** 连接创建事件 */
  connectionCreated: (connectionId: string) => void;
  /** 连接销毁事件 */
  connectionDestroyed: (connectionId: string) => void;
  /** 连接获取事件 */
  connectionAcquired: (connectionId: string) => void;
  /** 连接释放事件 */
  connectionReleased: (connectionId: string) => void;
  /** 连接池满事件 */
  poolFull: () => void;
  /** 连接池空事件 */
  poolEmpty: () => void;
}

/**
 * 连接包装器
 */
interface ConnectionWrapper<T> {
  id: string;
  connection: T;
  createdAt: number;
  lastUsedAt: number;
  isActive: boolean;
}

/**
 * 等待队列项
 */
interface WaitingItem<T> {
  id: string;
  resolve: (connection: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * 连接池管理器
 */
export class ConnectionPool<T = any> extends EventEmitter {
  private config: ConnectionPoolConfig;
  private connections: Map<string, ConnectionWrapper<T>> = new Map();
  private waitingQueue: WaitingItem<T>[] = [];
  private stats = {
    connectionsCreated: 0,
    connectionsDestroyed: 0,
    totalWaitTime: 0,
    totalUseTime: 0,
    acquisitionCount: 0
  };
  private isShuttingDown = false;
  private connectionIdCounter = 0;

  constructor(config: ConnectionPoolConfig) {
    super();
    this.config = config;
    this.initialize();
  }

  /**
   * 获取连接
   */
  async acquire(createConnection: () => Promise<T>, poolId: string): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Connection pool is shutting down');
    }

    // 检查是否有可用连接
    const availableConnection = this.getAvailableConnection();
    if (availableConnection) {
      this.acquireConnection(availableConnection);
      return availableConnection.connection;
    }

    // 检查是否可以创建新连接
    if (this.canCreateConnection()) {
      const connection = await this.createConnection(createConnection, poolId);
      this.acquireConnection(connection);
      return connection.connection;
    }

    // 加入等待队列
    return this.waitForConnection(createConnection, poolId);
  }

  /**
   * 释放连接
   */
  release(connection: T): void {
    const wrapper = Array.from(this.connections.values())
      .find(w => w.connection === connection);
    
    if (!wrapper) {
      throw new Error('Connection not found in pool');
    }

    if (!wrapper.isActive) {
      throw new Error('Connection is not active');
    }

    this.releaseConnection(wrapper);
  }

  /**
   * 销毁连接
   */
  destroy(connection: T): void {
    const wrapper = Array.from(this.connections.values())
      .find(w => w.connection === connection);
    
    if (!wrapper) {
      throw new Error('Connection not found in pool');
    }

    this.destroyConnection(wrapper);
  }

  /**
   * 获取统计信息
   */
  getStats(): PoolStats {
    const totalConnections = this.connections.size;
    const availableConnections = Array.from(this.connections.values())
      .filter(w => !w.isActive).length;
    const activeConnections = totalConnections - availableConnections;
    const waitingQueueLength = this.waitingQueue.length;
    
    const averageWaitTime = this.stats.acquisitionCount > 0 
      ? Math.round(this.stats.totalWaitTime / this.stats.acquisitionCount)
      : 0;
    
    const averageUseTime = this.stats.acquisitionCount > 0
      ? Math.round(this.stats.totalUseTime / this.stats.acquisitionCount)
      : 0;

    return {
      totalConnections,
      availableConnections,
      activeConnections,
      waitingQueueLength,
      connectionsCreated: this.stats.connectionsCreated,
      connectionsDestroyed: this.stats.connectionsDestroyed,
      averageWaitTime,
      averageUseTime
    };
  }

  /**
   * 关闭连接池
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // 拒绝所有等待的请求
    const waitingItems = [...this.waitingQueue];
    this.waitingQueue = [];
    
    waitingItems.forEach(item => {
      item.reject(new Error('Connection pool is shutting down'));
    });

    // 销毁所有连接
    const connections = Array.from(this.connections.values());
    this.connections.clear();

    // 执行清理操作
    await Promise.allSettled(
      connections.map(wrapper => this.cleanupConnection(wrapper.connection))
    );

    this.removeAllListeners();
  }

  /**
   * 初始化连接池
   */
  private initialize(): void {
    // 创建最小连接数
    this.ensureMinimumConnections();
    
    // 启动清理定时器
    this.startCleanupTimer();
  }

  /**
   * 确保最小连接数
   */
  private ensureMinimumConnections(): void {
    const currentCount = this.connections.size;
    
    if (currentCount < this.config.minConnections) {
      // 这里可以异步创建连接，但为了简化，暂时不实现
      // 在实际应用中，可以在这里预创建连接
    }
  }

  /**
   * 获取可用连接
   */
  private getAvailableConnection(): ConnectionWrapper<T> | null {
    const now = Date.now();
    
    for (const wrapper of this.connections.values()) {
      if (!wrapper.isActive) {
        // 检查连接是否过期
        if (this.isConnectionExpired(wrapper, now)) {
          this.destroyConnection(wrapper);
          continue;
        }
        
        return wrapper;
      }
    }
    
    return null;
  }

  /**
   * 是否可以创建新连接
   */
  private canCreateConnection(): boolean {
    return this.connections.size < this.config.maxConnections;
  }

  /**
   * 创建连接
   */
  private async createConnection(
    createConnection: () => Promise<T>, 
    poolId: string
  ): Promise<ConnectionWrapper<T>> {
    const connectionId = this.generateConnectionId();
    
    try {
      const connection = await createConnection();
      
      const wrapper: ConnectionWrapper<T> = {
        id: connectionId,
        connection,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        isActive: false
      };
      
      this.connections.set(connectionId, wrapper);
      this.stats.connectionsCreated++;
      
      this.emit('connectionCreated', connectionId);
      
      return wrapper;
    } catch (error) {
      throw new Error(`Failed to create connection: ${error}`);
    }
  }

  /**
   * 获取连接
   */
  private acquireConnection(wrapper: ConnectionWrapper<T>): void {
    wrapper.isActive = true;
    wrapper.lastUsedAt = Date.now();
    
    this.stats.acquisitionCount++;
    
    this.emit('connectionAcquired', wrapper.id);
  }

  /**
   * 释放连接
   */
  private releaseConnection(wrapper: ConnectionWrapper<T>): void {
    wrapper.isActive = false;
    wrapper.lastUsedAt = Date.now();
    
    this.emit('connectionReleased', wrapper.id);
    
    // 处理等待队列
    this.processWaitingQueue();
  }

  /**
   * 销毁连接
   */
  private destroyConnection(wrapper: ConnectionWrapper<T>): void {
    this.connections.delete(wrapper.id);
    this.stats.connectionsDestroyed++;
    
    this.emit('connectionDestroyed', wrapper.id);
    
    // 执行清理操作
    this.cleanupConnection(wrapper.connection);
  }

  /**
   * 等待连接
   */
  private waitForConnection(
    createConnection: () => Promise<T>, 
    poolId: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const waitingItem: WaitingItem<T> = {
        id: this.generateConnectionId(),
        resolve,
        reject,
        timestamp: Date.now()
      };
      
      this.waitingQueue.push(waitingItem);
      
      // 触发池满事件
      this.emit('poolFull');
    });
  }

  /**
   * 处理等待队列
   */
  private processWaitingQueue(): void {
    if (this.waitingQueue.length === 0) {
      return;
    }

    const availableConnection = this.getAvailableConnection();
    if (!availableConnection) {
      return;
    }

    const waitingItem = this.waitingQueue.shift()!;
    const waitTime = Date.now() - waitingItem.timestamp;
    
    this.stats.totalWaitTime += waitTime;
    
    this.acquireConnection(availableConnection);
    waitingItem.resolve(availableConnection.connection);
  }

  /**
   * 检查连接是否过期
   */
  private isConnectionExpired(wrapper: ConnectionWrapper<T>, now: number): boolean {
    const age = now - wrapper.createdAt;
    const idleTime = now - wrapper.lastUsedAt;
    
    return age > this.config.connectionLifetime || 
           (idleTime > this.config.idleTimeout && !wrapper.isActive);
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredConnections();
    }, 60000); // 每分钟检查一次
  }

  /**
   * 清理过期连接
   */
  private cleanupExpiredConnections(): void {
    const now = Date.now();
    const connectionsToDestroy: ConnectionWrapper<T>[] = [];
    
    for (const wrapper of this.connections.values()) {
      if (!wrapper.isActive && this.isConnectionExpired(wrapper, now)) {
        connectionsToDestroy.push(wrapper);
      }
    }
    
    // 确保保留最小连接数
    const remainingCount = this.connections.size - connectionsToDestroy.length;
    
    if (remainingCount < this.config.minConnections) {
      const keepCount = this.config.minConnections - remainingCount;
      connectionsToDestroy.splice(keepCount);
    }
    
    // 销毁过期连接
    connectionsToDestroy.forEach(wrapper => {
      this.destroyConnection(wrapper);
    });
    
    // 触发池空事件
    if (this.connections.size === 0) {
      this.emit('poolEmpty');
    }
  }

  /**
   * 清理连接
   */
  private async cleanupConnection(connection: T): Promise<void> {
    // 这里可以实现具体的清理逻辑
    // 例如关闭数据库连接、释放资源等
    
    // 触发事件
    this.emit('connectionDestroyed', (connection as any).id || 'unknown');
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(): string {
    return `conn_${++this.connectionIdCounter}_${Date.now()}`;
  }
}