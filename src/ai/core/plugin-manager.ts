import { Injectable, Logger } from '@nestjs/common';
import { readdir, readFile, writeFile, unlink, mkdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { createRequire } from 'module';

export interface PluginTool {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  inputSchema?: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        description?: string;
      }
    >;
    required?: string[];
    additionalProperties?: boolean;
  };
  argumentsType?: string;
  execute: (...args: any[]) => Promise<any>;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tools: PluginTool[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  main: string; // 主文件路径
  tools: string[]; // 工具文件列表
}

export interface PluginModuleExports {
  tools?: PluginTool[];
  metadata?: {
    id: string;
    name: string;
    description: string;
    version: string;
    category: string;
  };
  plugin?: {
    metadata: {
      id: string;
      name: string;
      description: string;
      version: string;
      category: string;
    };
    tools: PluginTool[];
  };
}

@Injectable()
export class PluginManager {
  private readonly logger = new Logger(PluginManager.name);
  private readonly pluginsPath = join(process.cwd(), 'src/ai/plugins');
  private readonly loadedPlugins = new Map<string, Plugin>();
  private readonly require = createRequire(__filename);
  private tsNodeRegistered = false;

  constructor() {
    this.tryRegisterTsNode();
    void this.ensurePluginsDirectory();
  }

  private tryRegisterTsNode(): void {
    if (this.tsNodeRegistered) return;
    try {
      // In Nest dev/watch, loading plugin source (.ts) is easiest via ts-node
      // so that plugin modules can use normal TS/Node resolution.
      this.require('ts-node/register/transpile-only');
      this.tsNodeRegistered = true;
    } catch {
      // In production builds, ts-node may not be present; ignore.
      this.tsNodeRegistered = false;
    }
  }

  /**
   * 确保插件目录存在
   */
  private async ensurePluginsDirectory(): Promise<void> {
    try {
      await stat(this.pluginsPath);
    } catch {
      await mkdir(this.pluginsPath, { recursive: true });
      this.logger.log('Created plugins directory');
    }
  }

  /**
   * 创建新插件
   */
  async createPlugin(config: Omit<PluginConfig, 'tools'>): Promise<Plugin> {
    const pluginDir = join(this.pluginsPath, config.id);

    try {
      // 创建插件目录
      await mkdir(pluginDir, { recursive: true });

      // 创建插件配置文件
      const pluginConfig: PluginConfig = {
        ...config,
        tools: [],
      };

      await writeFile(
        join(pluginDir, 'plugin.json'),
        JSON.stringify(pluginConfig, null, 2),
      );

      // 创建主文件模板
      const mainFileContent = this.generateMainFileTemplate(config);
      await writeFile(join(pluginDir, config.main), mainFileContent);

      // 创建插件对象
      const plugin: Plugin = {
        ...config,
        tools: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.loadedPlugins.set(config.id, plugin);
      this.logger.log(`Created plugin: ${config.name} (${config.id})`);

      return plugin;
    } catch (error) {
      this.logger.error(
        `Failed to create plugin ${config.id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新插件
   */
  async updatePlugin(
    pluginId: string,
    updates: Partial<PluginConfig>,
  ): Promise<Plugin> {
    const pluginDir = join(this.pluginsPath, pluginId);
    const configPath = join(pluginDir, 'plugin.json');

    try {
      // 读取现有配置
      const configContent = await readFile(configPath, 'utf-8');
      const config: PluginConfig = JSON.parse(configContent);

      // 更新配置
      const updatedConfig = { ...config, ...updates };
      await writeFile(configPath, JSON.stringify(updatedConfig, null, 2));

      // 重新加载插件
      const plugin = await this.loadPlugin(pluginId);
      this.logger.log(`Updated plugin: ${pluginId}`);

      return plugin;
    } catch (error) {
      this.logger.error(
        `Failed to update plugin ${pluginId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 加载单个插件
   */
  async loadPlugin(pluginId: string): Promise<Plugin> {
    const pluginDir = join(this.pluginsPath, pluginId);

    try {
      // 无 plugin.json 时使用统一插件标准：默认加载 index.ts/js，并从导出的 metadata/tools 构造
      const entryPath = await this.resolvePluginEntry(pluginDir);
      const pluginModule = this.loadPluginModule(entryPath);

      const meta = pluginModule.plugin?.metadata || pluginModule.metadata;
      const tools = pluginModule.plugin?.tools || pluginModule.tools || [];
      if (!meta) {
        throw new Error(
          'Plugin module missing metadata export (expected export const metadata = {...} or export const plugin = { metadata, tools })',
        );
      }

      const plugin = {
        id: meta.id,
        name: meta.name,
        description: meta.description,
        version: meta.version,
        category: meta.category,
        tools,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.loadedPlugins.set(pluginId, plugin);
      this.logger.log(`Loaded plugin: ${plugin.name} (${pluginId})`);

      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 加载所有插件
   */
  async loadAllPlugins(): Promise<Plugin[]> {
    try {
      const pluginDirs = await readdir(this.pluginsPath);
      const plugins: Plugin[] = [];

      for (const dir of pluginDirs) {
        const pluginPath = join(this.pluginsPath, dir);
        const stats = await stat(pluginPath);

        if (stats.isDirectory()) {
          try {
            const plugin = await this.loadPlugin(dir);
            plugins.push(plugin);
          } catch (error) {
            this.logger.warn(`Skipped invalid plugin directory: ${dir}`);
          }
        }
      }

      this.logger.log(`Loaded ${plugins.length} plugins`);
      return plugins;
    } catch (error) {
      this.logger.error(`Failed to load plugins: ${error.message}`);
      return [];
    }
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  private async resolvePluginEntry(pluginDir: string): Promise<string> {
    const candidates = [
      join(pluginDir, 'index.ts'),
      join(pluginDir, 'index.js'),
      join(pluginDir, 'main.ts'),
      join(pluginDir, 'main.js'),
    ];

    for (const p of candidates) {
      if (await this.pathExists(p)) return p;
    }

    // 兼容旧实现：尝试无扩展名
    return join(pluginDir, 'index');
  }

  private loadPluginModule(modulePath: string): PluginModuleExports {
    return this.require(modulePath) as PluginModuleExports;
  }

  /**
   * 删除插件
   */
  async deletePlugin(pluginId: string): Promise<void> {
    const pluginDir = join(this.pluginsPath, pluginId);

    try {
      // 从内存中移除
      this.loadedPlugins.delete(pluginId);

      // 删除插件目录（递归删除）
      await this.removeDirectory(pluginDir);

      this.logger.log(`Deleted plugin: ${pluginId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete plugin ${pluginId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * 获取插件的工具
   */
  getPluginTools(pluginId: string): PluginTool[] {
    const plugin = this.loadedPlugins.get(pluginId);
    return plugin?.tools || [];
  }

  /**
   * 获取所有工具
   */
  getAllTools(): PluginTool[] {
    const tools: PluginTool[] = [];
    for (const plugin of this.loadedPlugins.values()) {
      if (plugin.isActive) {
        tools.push(...plugin.tools);
      }
    }
    return tools;
  }

  /**
   * 按名称查找工具
   */
  getToolByName(toolName: string): PluginTool | undefined {
    for (const plugin of this.loadedPlugins.values()) {
      if (!plugin.isActive) continue;
      const tool = plugin.tools.find((t) => t.name === toolName);
      if (tool) return tool;
    }
    return undefined;
  }

  /**
   * 执行工具
   */
  async executeTool(toolName: string, ...args: any[]): Promise<any> {
    for (const plugin of this.loadedPlugins.values()) {
      if (!plugin.isActive) continue;

      const tool = plugin.tools.find((t) => t.name === toolName);
      if (tool) {
        try {
          this.logger.log(
            `Executing tool: ${toolName} from plugin: ${plugin.id}`,
          );
          return await tool.execute(...args);
        } catch (error) {
          this.logger.error(
            `Tool execution failed: ${toolName} - ${error.message}`,
          );
          throw error;
        }
      }
    }

    throw new Error(`Tool not found: ${toolName}`);
  }

  /**
   * 生成主文件模板
   */
  private generateMainFileTemplate(
    config: Omit<PluginConfig, 'tools'>,
  ): string {
    return `/**
 * ${config.name} Plugin
 * ${config.description}
 * Version: ${config.version}
 */

import { PluginTool } from '../core/plugin-manager';

// 示例工具
const exampleTool: PluginTool = {
  name: '${config.id}.example',
  description: '示例工具',
  parameters: [
    {
      name: 'input',
      type: 'string',
      description: '输入参数',
      required: true,
    },
  ],
  async execute(input: string): Promise<string> {
    return \`Hello from \${input}\`;
  },
};

// 导出所有工具
export const tools: PluginTool[] = [
  exampleTool,
];

// 插件元数据
export const metadata = {
  id: '${config.id}',
  name: '${config.name}',
  description: '${config.description}',
  version: '${config.version}',
  category: '${config.category}',
};
`;
  }

  /**
   * 递归删除目录
   */
  private async removeDirectory(dirPath: string): Promise<void> {
    try {
      const files = await readdir(dirPath);

      for (const file of files) {
        const filePath = join(dirPath, file);
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
          await this.removeDirectory(filePath);
        } else {
          await unlink(filePath);
        }
      }

      // 删除空目录
      const { rmdir } = await import('fs/promises');
      await rmdir(dirPath);
    } catch (error) {
      // 目录不存在时忽略错误
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
