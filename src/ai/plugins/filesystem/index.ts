/**
 * 文件系统插件
 * 提供文件和目录操作功能，使用统一的数据库表结构
 * Version: 2.0.0
 */

import { PluginTool } from '../../core/plugin-manager';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { DataSource, Repository } from 'typeorm';
import { PluginEntity } from '../../../entities/plugin.entity';
import { PluginUsageEntity } from '../../../entities/plugin_usage.entity';
import { PluginRuntimeEntity } from '../../../entities/plugin_runtime.entity';

// 调用记录接口
interface CallRecord {
  toolName: string;
  parameters: any[];
  result: any;
  success: boolean;
  timestamp: number;
  executionTime: number;
  error?: string;
}

// 缓存项接口
interface CacheItem {
  key: string;
  value: any;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

// 插件统计信息接口
interface PluginStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  toolUsage: Record<string, number>;
  cacheHitRate: number;
}

// 文件系统插件类
class FileSystemPlugin {
  private callHistory: CallRecord[] = [];
  private cache: Map<string, CacheItem> = new Map();
  private readonly maxHistorySize = 1000;
  private readonly defaultCacheTTL = 5 * 60 * 1000; // 5分钟

  // 数据库连接器
  private dataSource?: DataSource;
  private pluginRepository?: Repository<PluginEntity>;
  private pluginUsageRepository?: Repository<PluginUsageEntity>;
  private pluginRuntimeRepository?: Repository<PluginRuntimeEntity>;
  private readonly pluginId = 'filesystem';

  /**
   * 设置数据库连接器
   */
  setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
    if (dataSource && dataSource.isInitialized) {
      this.pluginRepository = dataSource.getRepository(PluginEntity);
      this.pluginUsageRepository = dataSource.getRepository(PluginUsageEntity);
      this.pluginRuntimeRepository =
        dataSource.getRepository(PluginRuntimeEntity);

      // 初始化插件记录
      void this.initializePluginRecord();
    }
  }

  /**
   * 初始化插件记录
   */
  private async initializePluginRecord(): Promise<void> {
    if (!this.pluginRepository) return;

    try {
      const existingPlugin = await this.pluginRepository.findOne({
        where: { id: this.pluginId },
      });

      if (!existingPlugin) {
        const pluginRecord = this.pluginRepository.create({
          id: this.pluginId,
          plugin_name: 'filesystem',
        });
        await this.pluginRepository.save(pluginRecord);
      }
    } catch (error) {
      console.error('Failed to initialize plugin record:', error);
    }
  }

  /**
   * 检查是否有数据库连接
   */
  private hasDatabase(): boolean {
    return !!(
      this.dataSource &&
      this.dataSource.isInitialized &&
      this.pluginUsageRepository &&
      this.pluginRuntimeRepository
    );
  }

  /**
   * 记录调用历史
   */
  private async recordCall(
    toolName: string,
    parameters: any[],
    result: any,
    success: boolean,
    executionTime: number,
    error?: string,
    sessionId?: string,
    userId?: string,
  ): Promise<void> {
    const record: CallRecord = {
      toolName,
      parameters,
      result,
      success,
      timestamp: Date.now(),
      executionTime,
      error,
    };

    // 内存中记录
    this.callHistory.push(record);

    // 限制历史记录大小
    if (this.callHistory.length > this.maxHistorySize) {
      this.callHistory.shift();
    }

    // 数据库中记录
    if (this.hasDatabase() && this.pluginUsageRepository) {
      try {
        const dbRecord = this.pluginUsageRepository.create({
          plugin_name: this.pluginId,
          tool_name: toolName,
          tool_params: parameters,
          result,
          success,
          execution_time: executionTime,
          error,
          session_id: sessionId,
          user_id: userId,
        });
        await this.pluginUsageRepository.save(dbRecord);
      } catch (dbError) {
        console.error('Failed to save call record to database:', dbError);
      }
    }
  }

  /**
   * 获取调用历史
   */
  async getCallHistory(
    toolName?: string,
    limit?: number,
    fromDatabase: boolean = false,
  ): Promise<CallRecord[]> {
    // 如果不使用数据库或数据库不可用，返回内存中的历史
    if (!fromDatabase || !this.hasDatabase() || !this.pluginUsageRepository) {
      let history = this.callHistory;

      if (toolName) {
        history = history.filter((record) => record.toolName === toolName);
      }

      if (limit) {
        history = history.slice(-limit);
      }

      return history;
    }

    // 从数据库获取历史记录
    try {
      const queryBuilder = this.pluginUsageRepository
        .createQueryBuilder('usage')
        .where('usage.plugin_name = :pluginName', { pluginName: this.pluginId })
        .orderBy('usage.created_at', 'DESC');

      if (toolName) {
        queryBuilder.andWhere('usage.tool_name = :toolName', { toolName });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const dbRecords = await queryBuilder.getMany();

      // 转换为 CallRecord 格式
      return dbRecords.map((record) => ({
        toolName: record.tool_name,
        parameters: Array.isArray(record.tool_params) ? record.tool_params : [],
        result: record.result,
        success: record.success,
        timestamp: record.created_at,
        executionTime: record.execution_time,
        error: record.error || undefined,
      }));
    } catch (error) {
      console.error('Failed to get call history from database:', error);
      // 降级到内存历史
      return this.getCallHistory(toolName, limit, false);
    }
  }

  /**
   * 获取最后一次调用
   */
  async getLastCall(
    toolName?: string,
    fromDatabase: boolean = false,
  ): Promise<CallRecord | null> {
    const history = await this.getCallHistory(toolName, 1, fromDatabase);
    return history.length > 0 ? history[0] : null;
  }

  /**
   * 清除调用历史
   */
  async clearCallHistory(clearDatabase: boolean = false): Promise<void> {
    // 清除内存历史
    this.callHistory = [];

    // 清除数据库历史
    if (clearDatabase && this.hasDatabase() && this.pluginUsageRepository) {
      try {
        await this.pluginUsageRepository.delete({ plugin_name: this.pluginId });
      } catch (error) {
        console.error('Failed to clear call history from database:', error);
      }
    }
  }

  /**
   * 设置缓存
   */
  private async setCache(
    key: string,
    value: any,
    ttl: number = this.defaultCacheTTL,
  ): Promise<void> {
    const item: CacheItem = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    };

    // 内存缓存
    this.cache.set(key, item);

    // 数据库缓存 - 存储到运行时数据表
    if (this.hasDatabase() && this.pluginRuntimeRepository) {
      try {
        // 获取或创建运行时记录
        let runtimeRecord = await this.pluginRuntimeRepository.findOne({
          where: { plugin_name: this.pluginId },
        });

        if (!runtimeRecord) {
          runtimeRecord = this.pluginRuntimeRepository.create({
            plugin_name: this.pluginId,
            runtime_data: { cache: {} },
          });
        }

        // 确保 runtime_data 有 cache 对象
        if (!runtimeRecord.runtime_data) {
          runtimeRecord.runtime_data = { cache: {} };
        }
        if (!runtimeRecord.runtime_data.cache) {
          runtimeRecord.runtime_data.cache = {};
        }

        // 更新缓存数据
        runtimeRecord.runtime_data.cache[key] = {
          value,
          timestamp: item.timestamp,
          ttl,
        };

        await this.pluginRuntimeRepository.save(runtimeRecord);
      } catch (error) {
        console.error('Failed to save cache item to database:', error);
      }
    }
  }

  /**
   * 获取缓存
   */
  private async getCache(
    key: string,
    fromDatabase: boolean = false,
  ): Promise<any | null> {
    // 优先从内存获取
    if (!fromDatabase) {
      const item = this.cache.get(key);
      if (item) {
        // 检查是否过期
        const now = Date.now();
        const itemTime = item.timestamp;
        if (now - itemTime > item.ttl) {
          this.cache.delete(key);
          // 同时删除数据库中的过期项
          await this.removeCacheFromDatabase(key);
          return null;
        }
        return item.value;
      }
    }

    // 从数据库获取
    if (this.hasDatabase() && this.pluginRuntimeRepository) {
      try {
        const runtimeRecord = await this.pluginRuntimeRepository.findOne({
          where: { plugin_name: this.pluginId },
        });

        if (runtimeRecord?.runtime_data?.cache?.[key]) {
          const cacheItem = runtimeRecord.runtime_data.cache[key];
          const timestamp = cacheItem.timestamp;

          // 检查是否过期
          const now = Date.now();
          const itemTime = timestamp.getTime();
          if (now - itemTime > cacheItem.ttl) {
            // 删除过期项
            await this.removeCacheFromDatabase(key);
            return null;
          }

          // 同步到内存缓存
          const memoryItem: CacheItem = {
            key,
            value: cacheItem.value,
            timestamp,
            ttl: cacheItem.ttl,
          };
          this.cache.set(key, memoryItem);

          return cacheItem.value;
        }
      } catch (error) {
        console.error('Failed to get cache item from database:', error);
      }
    }

    return null;
  }

  /**
   * 从数据库中删除缓存项
   */
  private async removeCacheFromDatabase(key: string): Promise<void> {
    if (!this.hasDatabase() || !this.pluginRuntimeRepository) return;

    try {
      const runtimeRecord = await this.pluginRuntimeRepository.findOne({
        where: { plugin_name: this.pluginId },
      });

      if (runtimeRecord?.runtime_data?.cache?.[key]) {
        delete runtimeRecord.runtime_data.cache[key];
        await this.pluginRuntimeRepository.save(runtimeRecord);
      }
    } catch (error) {
      console.error('Failed to remove cache item from database:', error);
    }
  }

  /**
   * 清除缓存
   */
  async clearCache(clearDatabase: boolean = false): Promise<void> {
    // 清除内存缓存
    this.cache.clear();

    // 清除数据库缓存
    if (clearDatabase && this.hasDatabase() && this.pluginRuntimeRepository) {
      try {
        const runtimeRecord = await this.pluginRuntimeRepository.findOne({
          where: { plugin_name: this.pluginId },
        });

        if (runtimeRecord) {
          if (!runtimeRecord.runtime_data) {
            runtimeRecord.runtime_data = {};
          }
          runtimeRecord.runtime_data.cache = {};
          await this.pluginRuntimeRepository.save(runtimeRecord);
        }
      } catch (error) {
        console.error('Failed to clear cache from database:', error);
      }
    }
  }

  /**
   * 清除过期缓存
   */
  private async cleanExpiredCache(): Promise<void> {
    const now = Date.now();

    // 清理内存缓存
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }

    // 清理数据库缓存
    if (this.hasDatabase() && this.pluginRuntimeRepository) {
      try {
        const runtimeRecord = await this.pluginRuntimeRepository.findOne({
          where: { plugin_name: this.pluginId },
        });

        if (runtimeRecord?.runtime_data?.cache) {
          const cache = runtimeRecord.runtime_data.cache;
          let hasExpiredItems = false;

          for (const [key, cacheItem] of Object.entries(cache)) {
            const item = cacheItem as any;
            const timestamp = new Date(item.timestamp).getTime();
            if (now - timestamp > item.ttl) {
              delete cache[key];
              hasExpiredItems = true;
            }
          }

          if (hasExpiredItems) {
            await this.pluginRuntimeRepository.save(runtimeRecord);
          }
        }
      } catch (error) {
        console.error('Failed to clean expired cache from database:', error);
      }
    }
  }

  /**
   * 执行工具并记录
   */
  private async executeWithTracking<T>(
    toolName: string,
    parameters: any[],
    executor: () => Promise<T>,
    sessionId?: string,
    userId?: string,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await executor();
      const executionTime = Date.now() - startTime;

      await this.recordCall(
        toolName,
        parameters,
        result,
        true,
        executionTime,
        undefined,
        sessionId,
        userId,
      );
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.recordCall(
        toolName,
        parameters,
        null,
        false,
        executionTime,
        error.message,
        sessionId,
        userId,
      );
      throw error;
    }
  }

  /**
   * 创建文件
   */
  async createFile(
    path: string,
    content: string = '',
    sessionId?: string,
    userId?: string,
  ): Promise<string> {
    return this.executeWithTracking(
      'filesystem.create_file',
      [path, content],
      async () => {
        try {
          // 确保目录存在
          const dir = dirname(path);
          await fs.mkdir(dir, { recursive: true });

          // 创建文件
          await fs.writeFile(path, content, 'utf-8');

          // 清除相关缓存
          await this.clearCacheByPattern(`file_exists_${path}`);
          await this.clearCacheByPattern(`read_file_${path}`);

          return `文件创建成功: ${path}`;
        } catch (error) {
          throw new Error(`创建文件失败: ${error.message}`);
        }
      },
      sessionId,
      userId,
    );
  }

  /**
   * 清除匹配模式的缓存
   */
  private async clearCacheByPattern(pattern: string): Promise<void> {
    // 清除内存缓存
    this.cache.delete(pattern);

    // 清除数据库缓存
    await this.removeCacheFromDatabase(pattern);
  }

  /**
   * 获取插件统计信息
   */
  async getStats(fromDatabase: boolean = false): Promise<PluginStats> {
    if (!fromDatabase) {
      // 从内存计算统计信息
      const totalCalls = this.callHistory.length;
      const successfulCalls = this.callHistory.filter(
        (record) => record.success,
      ).length;
      const failedCalls = totalCalls - successfulCalls;

      const executionTimes = this.callHistory
        .filter((record) => record.success)
        .map((record) => record.executionTime);
      const averageExecutionTime =
        executionTimes.length > 0
          ? executionTimes.reduce((sum, time) => sum + time, 0) /
            executionTimes.length
          : 0;

      const toolUsage: Record<string, number> = {};
      this.callHistory.forEach((record) => {
        toolUsage[record.toolName] = (toolUsage[record.toolName] || 0) + 1;
      });

      // 计算缓存命中率（简化版本）
      const cacheHitRate = 0; // 需要更复杂的逻辑来跟踪缓存命中

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        averageExecutionTime,
        toolUsage,
        cacheHitRate,
      };
    }

    // 从数据库计算统计信息
    if (!this.hasDatabase() || !this.pluginUsageRepository) {
      return this.getStats(false); // 降级到内存统计
    }

    try {
      const totalCalls = await this.pluginUsageRepository.count({
        where: { plugin_name: this.pluginId },
      });

      const successfulCalls = await this.pluginUsageRepository.count({
        where: { plugin_name: this.pluginId, success: true },
      });

      const failedCalls = totalCalls - successfulCalls;

      // 计算平均执行时间
      const avgResult = await this.pluginUsageRepository
        .createQueryBuilder('usage')
        .select('AVG(usage.execution_time)', 'avgTime')
        .where('usage.plugin_name = :pluginName', { pluginName: this.pluginId })
        .andWhere('usage.success = :success', { success: true })
        .getRawOne();

      const averageExecutionTime = parseFloat(avgResult?.avgTime || '0');

      // 统计工具使用频率
      const toolUsageResult = await this.pluginUsageRepository
        .createQueryBuilder('usage')
        .select('usage.tool_name', 'toolName')
        .addSelect('COUNT(*)', 'count')
        .where('usage.plugin_name = :pluginName', { pluginName: this.pluginId })
        .groupBy('usage.tool_name')
        .getRawMany();

      const toolUsage: Record<string, number> = {};
      toolUsageResult.forEach((item: any) => {
        toolUsage[item.toolName] = parseInt(item.count);
      });

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        averageExecutionTime,
        toolUsage,
        cacheHitRate: 0, // 需要更复杂的逻辑来计算
      };
    } catch (error) {
      console.error('Failed to get stats from database:', error);
      return this.getStats(false); // 降级到内存统计
    }
  }

  /**
   * 读取文件（带缓存）
   */
  async readFile(
    path: string,
    useCache: boolean = true,
    sessionId?: string,
    userId?: string,
  ): Promise<string> {
    const cacheKey = `read_file_${path}`;

    // 检查缓存
    if (useCache) {
      const cached = await this.getCache(cacheKey);
      if (cached !== null) {
        // 记录缓存命中
        await this.recordCall(
          'filesystem.read_file',
          [path, useCache],
          cached,
          true,
          0,
          undefined,
          sessionId,
          userId,
        );
        return cached;
      }
    }

    return this.executeWithTracking(
      'filesystem.read_file',
      [path, useCache],
      async () => {
        try {
          const content = await fs.readFile(path, 'utf-8');

          // 缓存结果
          if (useCache) {
            await this.setCache(cacheKey, content);
          }

          return content;
        } catch (error) {
          throw new Error(`读取文件失败: ${error.message}`);
        }
      },
      sessionId,
      userId,
    );
  }

  /**
   * 写入文件
   */
  async writeFile(
    path: string,
    content: string,
    sessionId?: string,
    userId?: string,
  ): Promise<string> {
    return this.executeWithTracking(
      'filesystem.write_file',
      [path, content],
      async () => {
        try {
          // 确保目录存在
          const dir = dirname(path);
          await fs.mkdir(dir, { recursive: true });

          // 写入文件
          await fs.writeFile(path, content, 'utf-8');

          // 清除相关缓存
          await this.clearCacheByPattern(`file_exists_${path}`);
          await this.clearCacheByPattern(`read_file_${path}`);

          return `文件写入成功: ${path}`;
        } catch (error) {
          throw new Error(`写入文件失败: ${error.message}`);
        }
      },
      sessionId,
      userId,
    );
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<string> {
    return this.executeWithTracking(
      'filesystem.delete_file',
      [path],
      async () => {
        try {
          await fs.unlink(path);

          // 清除相关缓存
          this.cache.delete(`file_exists_${path}`);
          this.cache.delete(`read_file_${path}`);

          return `文件删除成功: ${path}`;
        } catch (error) {
          throw new Error(`删除文件失败: ${error.message}`);
        }
      },
    );
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<string> {
    return this.executeWithTracking(
      'filesystem.create_directory',
      [path],
      async () => {
        try {
          await fs.mkdir(path, { recursive: true });

          // 清除相关缓存
          this.cache.delete(`directory_exists_${path}`);
          this.cache.delete(`list_directory_${dirname(path)}`);

          return `目录创建成功: ${path}`;
        } catch (error) {
          throw new Error(`创建目录失败: ${error.message}`);
        }
      },
    );
  }

  /**
   * 列出目录内容（带缓存）
   */
  async listDirectory(
    path: string,
    useCache: boolean = true,
  ): Promise<string[]> {
    const cacheKey = `list_directory_${path}`;

    // 检查缓存
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached !== null) {
        this.recordCall(
          'filesystem.list_directory',
          [path, useCache],
          cached,
          true,
          0,
        );
        return cached;
      }
    }

    return this.executeWithTracking(
      'filesystem.list_directory',
      [path, useCache],
      async () => {
        try {
          const files = await fs.readdir(path);

          // 缓存结果（较短的TTL，因为目录内容可能经常变化）
          if (useCache) {
            this.setCache(cacheKey, files, 60 * 1000); // 1分钟
          }

          return files;
        } catch (error) {
          throw new Error(`列出目录失败: ${error.message}`);
        }
      },
    );
  }

  /**
   * 检查文件是否存在（带缓存）
   */
  async fileExists(path: string, useCache: boolean = true): Promise<boolean> {
    const cacheKey = `file_exists_${path}`;

    // 检查缓存
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached !== null) {
        this.recordCall(
          'filesystem.file_exists',
          [path, useCache],
          cached,
          true,
          0,
        );
        return cached;
      }
    }

    return this.executeWithTracking(
      'filesystem.file_exists',
      [path, useCache],
      async () => {
        try {
          const stats = await fs.stat(path);
          const exists = stats.isFile();

          // 缓存结果
          if (useCache) {
            this.setCache(cacheKey, exists, 30 * 1000); // 30秒
          }

          return exists;
        } catch (error) {
          // 文件不存在也缓存结果
          if (useCache) {
            this.setCache(cacheKey, false, 30 * 1000);
          }
          return false;
        }
      },
    );
  }

  /**
   * 检查目录是否存在（带缓存）
   */
  async directoryExists(
    path: string,
    useCache: boolean = true,
  ): Promise<boolean> {
    const cacheKey = `directory_exists_${path}`;

    // 检查缓存
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached !== null) {
        this.recordCall(
          'filesystem.directory_exists',
          [path, useCache],
          cached,
          true,
          0,
        );
        return cached;
      }
    }

    return this.executeWithTracking(
      'filesystem.directory_exists',
      [path, useCache],
      async () => {
        try {
          const stats = await fs.stat(path);
          const exists = stats.isDirectory();

          // 缓存结果
          if (useCache) {
            this.setCache(cacheKey, exists, 30 * 1000); // 30秒
          }

          return exists;
        } catch (error) {
          // 目录不存在也缓存结果
          if (useCache) {
            this.setCache(cacheKey, false, 30 * 1000);
          }
          return false;
        }
      },
    );
  }

  /**
   * 获取数据库连接状态
   */
  getDatabaseStatus(): {
    connected: boolean;
    dataSourceInitialized: boolean;
    repositoriesReady: boolean;
  } {
    return {
      connected: !!this.dataSource,
      dataSourceInitialized: !!(
        this.dataSource && this.dataSource.isInitialized
      ),
      repositoriesReady: !!(
        this.pluginRepository &&
        this.pluginUsageRepository &&
        this.pluginRuntimeRepository
      ),
    };
  }
}

// 创建插件实例
const fileSystemPlugin = new FileSystemPlugin();

// 定期清理过期缓存
setInterval(async () => {
  await fileSystemPlugin['cleanExpiredCache']();
}, 60 * 1000); // 每分钟清理一次

// 创建工具定义
const createFile: PluginTool = {
  name: 'filesystem.create_file',
  description: '创建新文件',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '文件路径',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: '文件内容',
      required: false,
    },
  ],
  async execute(path: string, content: string = ''): Promise<string> {
    return fileSystemPlugin.createFile(path, content);
  },
};

const readFile: PluginTool = {
  name: 'filesystem.read_file',
  description: '读取文件内容',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '文件路径',
      required: true,
    },
    {
      name: 'useCache',
      type: 'boolean',
      description: '是否使用缓存',
      required: false,
    },
  ],
  async execute(path: string, useCache: boolean = true): Promise<string> {
    return fileSystemPlugin.readFile(path, useCache);
  },
};

const writeFile: PluginTool = {
  name: 'filesystem.write_file',
  description: '写入文件内容（覆盖）',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '文件路径',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: '文件内容',
      required: true,
    },
  ],
  async execute(path: string, content: string): Promise<string> {
    return fileSystemPlugin.writeFile(path, content);
  },
};

const deleteFile: PluginTool = {
  name: 'filesystem.delete_file',
  description: '删除文件',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '文件路径',
      required: true,
    },
  ],
  async execute(path: string): Promise<string> {
    return fileSystemPlugin.deleteFile(path);
  },
};

const createDirectory: PluginTool = {
  name: 'filesystem.create_directory',
  description: '创建目录',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '目录路径',
      required: true,
    },
  ],
  async execute(path: string): Promise<string> {
    return fileSystemPlugin.createDirectory(path);
  },
};

const listDirectory: PluginTool = {
  name: 'filesystem.list_directory',
  description: '列出目录内容',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '目录路径',
      required: true,
    },
    {
      name: 'useCache',
      type: 'boolean',
      description: '是否使用缓存',
      required: false,
    },
  ],
  async execute(path: string, useCache: boolean = true): Promise<string[]> {
    return fileSystemPlugin.listDirectory(path, useCache);
  },
};

const fileExists: PluginTool = {
  name: 'filesystem.file_exists',
  description: '检查文件是否存在',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '文件路径',
      required: true,
    },
    {
      name: 'useCache',
      type: 'boolean',
      description: '是否使用缓存',
      required: false,
    },
  ],
  async execute(path: string, useCache: boolean = true): Promise<boolean> {
    return fileSystemPlugin.fileExists(path, useCache);
  },
};

const directoryExists: PluginTool = {
  name: 'filesystem.directory_exists',
  description: '检查目录是否存在',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: '目录路径',
      required: true,
    },
    {
      name: 'useCache',
      type: 'boolean',
      description: '是否使用缓存',
      required: false,
    },
  ],
  async execute(path: string, useCache: boolean = true): Promise<boolean> {
    return fileSystemPlugin.directoryExists(path, useCache);
  },
};

const getCallHistory: PluginTool = {
  name: 'filesystem.get_call_history',
  description: '获取调用历史',
  parameters: [
    {
      name: 'toolName',
      type: 'string',
      description: '工具名称（可选）',
      required: false,
    },
    {
      name: 'limit',
      type: 'number',
      description: '限制返回数量',
      required: false,
    },
    {
      name: 'fromDatabase',
      type: 'boolean',
      description: '是否从数据库获取历史记录',
      required: false,
    },
  ],
  async execute(
    toolName?: string,
    limit?: number,
    fromDatabase: boolean = false,
  ): Promise<CallRecord[]> {
    return fileSystemPlugin.getCallHistory(toolName, limit, fromDatabase);
  },
};

const clearCache: PluginTool = {
  name: 'filesystem.clear_cache',
  description: '清除缓存',
  parameters: [
    {
      name: 'clearDatabase',
      type: 'boolean',
      description: '是否同时清除数据库缓存',
      required: false,
    },
  ],
  async execute(clearDatabase: boolean = false): Promise<string> {
    await fileSystemPlugin.clearCache(clearDatabase);
    return `缓存已清除${clearDatabase ? '（包括数据库）' : '（仅内存）'}`;
  },
};

const clearHistory: PluginTool = {
  name: 'filesystem.clear_history',
  description: '清除调用历史',
  parameters: [
    {
      name: 'clearDatabase',
      type: 'boolean',
      description: '是否同时清除数据库历史记录',
      required: false,
    },
  ],
  async execute(clearDatabase: boolean = false): Promise<string> {
    await fileSystemPlugin.clearCallHistory(clearDatabase);
    return `调用历史已清除${clearDatabase ? '（包括数据库）' : '（仅内存）'}`;
  },
};

// 新增：获取数据库连接状态工具
const getDatabaseStatus: PluginTool = {
  name: 'filesystem.get_database_status',
  description: '获取数据库连接状态',
  parameters: [],
  async execute(): Promise<any> {
    return fileSystemPlugin.getDatabaseStatus();
  },
};

// 新增：获取统计信息工具
const getStats: PluginTool = {
  name: 'filesystem.get_stats',
  description: '获取插件统计信息',
  parameters: [
    {
      name: 'fromDatabase',
      type: 'boolean',
      description: '是否从数据库获取统计信息',
      required: false,
    },
  ],
  async execute(fromDatabase: boolean = false): Promise<PluginStats> {
    return fileSystemPlugin.getStats(fromDatabase);
  },
};

// 新增：设置数据库连接器工具
const setDataSource: PluginTool = {
  name: 'filesystem.set_datasource',
  description: '设置数据库连接器（仅供系统内部使用）',
  parameters: [
    {
      name: 'dataSource',
      type: 'object',
      description: 'TypeORM DataSource 实例',
      required: true,
    },
  ],
  async execute(dataSource: DataSource): Promise<string> {
    fileSystemPlugin.setDataSource(dataSource);
    return '数据库连接器已设置';
  },
};

// 导出所有工具
export const tools: PluginTool[] = [
  createFile,
  readFile,
  writeFile,
  deleteFile,
  createDirectory,
  listDirectory,
  fileExists,
  directoryExists,
  getCallHistory,
  clearCache,
  clearHistory,
  getStats,
  getDatabaseStatus,
  setDataSource,
];

// 插件元数据
export const metadata = {
  id: 'filesystem',
  name: '文件系统插件',
  description:
    '提供文件和目录操作功能，支持调用历史记录和缓存，使用统一数据库表结构',
  version: '2.0.0',
  category: 'system',
};

// 导出插件实例（用于测试和调试）
export { fileSystemPlugin };
