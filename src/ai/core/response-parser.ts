import { Injectable, Logger } from '@nestjs/common';

export interface ParsedResponse {
  answer?: string;
  tools?: ToolCall[];
  think?: string;
  raw: string;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface AIResponseStructure {
  type: 'answer' | 'tools' | 'think';
  content: string;
  toolCalls?: ToolCall[];
}

@Injectable()
export class ResponseParser {
  private readonly logger = new Logger(ResponseParser.name);

  /**
   * 解析AI回复（HTML标签形式）
   *
   * 支持的标签格式：
   * <answer>回复内容</answer>
   * <tools>工具调用</tools>
   * <think>思考过程</think>
   */
  parseResponse(response: string): ParsedResponse {
    this.logger.log('Parsing AI response');

    const result: ParsedResponse = {
      raw: response,
    };

    try {
      // 解析 answer 标签
      const answerMatch = this.extractTag(response, 'answer');
      if (answerMatch) {
        result.answer = answerMatch.trim();
      }

      // 解析 think 标签
      const thinkMatch = this.extractTag(response, 'think');
      if (thinkMatch) {
        result.think = thinkMatch.trim();
      }

      // 解析 tools 标签
      const toolsMatch = this.extractTag(response, 'tools');
      if (toolsMatch) {
        result.tools = this.parseToolCalls(toolsMatch);
      }

      this.logger.log(
        `Parsed response: answer=${!!result.answer}, tools=${result.tools?.length || 0}, think=${!!result.think}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to parse response: ${error.message}`);

      // 如果解析失败，将整个回复作为 answer
      return {
        answer: response,
        raw: response,
      };
    }
  }

  /**
   * 提取HTML标签内容
   */
  private extractTag(text: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'is');
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  /**
   * 解析工具调用
   *
   * 支持的格式：
   * 1. JSON格式：{"name": "tool_name", "parameters": {...}}
   * 2. 函数调用格式：tool_name(param1="value1", param2="value2")
   * 3. 多个工具调用（换行分隔）
   */
  private parseToolCalls(toolsContent: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    try {
      // 尝试解析JSON格式
      if (
        toolsContent.trim().startsWith('{') ||
        toolsContent.trim().startsWith('[')
      ) {
        const parsed = JSON.parse(toolsContent);

        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.name) {
              toolCalls.push({
                name: item.name,
                parameters: item.parameters || {},
              });
            }
          }
        } else if (parsed.name) {
          toolCalls.push({
            name: parsed.name,
            parameters: parsed.parameters || {},
          });
        }
      } else {
        // 解析函数调用格式
        const lines = toolsContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);

        for (const line of lines) {
          const toolCall = this.parseFunctionCall(line);
          if (toolCall) {
            toolCalls.push(toolCall);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to parse tool calls: ${error.message}`);

      // 如果解析失败，尝试简单的文本解析
      const simpleToolCall = this.parseSimpleToolCall(toolsContent);
      if (simpleToolCall) {
        toolCalls.push(simpleToolCall);
      }
    }

    return toolCalls;
  }

  /**
   * 解析函数调用格式
   * 例如：create_file(path="/tmp/test.txt", content="Hello World")
   */
  private parseFunctionCall(line: string): ToolCall | null {
    const functionRegex = /^(\w+)\((.*)\)$/;
    const match = line.match(functionRegex);

    if (!match) {
      return null;
    }

    const [, functionName, paramsString] = match;
    const parameters: Record<string, any> = {};

    if (paramsString.trim()) {
      // 解析参数
      const paramRegex = /(\w+)=([^,]+)/g;
      let paramMatch;

      while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
        const [, paramName, paramValue] = paramMatch;

        // 尝试解析参数值
        let value: any = paramValue.trim();

        // 移除引号
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 尝试转换为数字或布尔值
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (!isNaN(Number(value))) {
          value = Number(value);
        }

        parameters[paramName] = value;
      }
    }

    return {
      name: functionName,
      parameters,
    };
  }

  /**
   * 解析简单的工具调用（仅工具名）
   */
  private parseSimpleToolCall(content: string): ToolCall | null {
    const toolName = content.trim();

    if (toolName && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(toolName)) {
      return {
        name: toolName,
        parameters: {},
      };
    }

    return null;
  }

  /**
   * 验证解析结果
   */
  validateParsedResponse(parsed: ParsedResponse): boolean {
    // 至少要有一个有效的部分
    return !!(parsed.answer || parsed.tools?.length || parsed.think);
  }

  /**
   * 格式化解析结果为可读文本
   */
  formatParsedResponse(parsed: ParsedResponse): string {
    const parts: string[] = [];

    if (parsed.think) {
      parts.push(`思考: ${parsed.think}`);
    }

    if (parsed.tools && parsed.tools.length > 0) {
      parts.push(
        `工具调用: ${parsed.tools.map((t) => `${t.name}(${JSON.stringify(t.parameters)})`).join(', ')}`,
      );
    }

    if (parsed.answer) {
      parts.push(`回复: ${parsed.answer}`);
    }

    return parts.join('\n\n');
  }

  /**
   * 生成标准化的AI回复格式
   */
  generateResponse(options: {
    answer?: string;
    tools?: ToolCall[];
    think?: string;
  }): string {
    const parts: string[] = [];

    if (options.think) {
      parts.push(`<think>${options.think}</think>`);
    }

    if (options.tools && options.tools.length > 0) {
      const toolsJson = JSON.stringify(options.tools, null, 2);
      parts.push(`<tools>${toolsJson}</tools>`);
    }

    if (options.answer) {
      parts.push(`<answer>${options.answer}</answer>`);
    }

    return parts.join('\n\n');
  }

  /**
   * 提取所有标签内容
   */
  extractAllTags(response: string): Record<string, string> {
    const tags: Record<string, string> = {};
    const tagRegex = /<(\w+)>(.*?)<\/\1>/gis;
    let match;

    while ((match = tagRegex.exec(response)) !== null) {
      const [, tagName, content] = match;
      tags[tagName] = content.trim();
    }

    return tags;
  }

  /**
   * 检查回复是否包含工具调用
   */
  hasToolCalls(response: string): boolean {
    return /<tools>.*?<\/tools>/is.test(response);
  }

  /**
   * 检查回复是否包含思考过程
   */
  hasThinking(response: string): boolean {
    return /<think>.*?<\/think>/is.test(response);
  }

  /**
   * 检查回复是否包含答案
   */
  hasAnswer(response: string): boolean {
    return /<answer>.*?<\/answer>/is.test(response);
  }
}
