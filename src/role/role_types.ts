// --- 基础枚举 ---

// 角色立场：决定模型思考的出发点
export const Stance = {
    SUPPORTIVE: "supportive", // 支持/建设性
    CRITICAL: "critical", // 批判/风控
    NEUTRAL_MODERATOR: "moderator", // 调停/主持
    ANALYTICAL: "analytical", // 数据分析/客观
    DECISION_MAKER: "decision_maker", // 最终决策
} as const;
export type Stance = (typeof Stance)[keyof typeof Stance];

// 消息来源类型
export type ParticipantType = "user" | "model" | "system";

// --- 数据结构 ---

// 1. 单条消息记录 (Timeline Item)
export interface LogEntry {
    id: string;
    timestamp: number;
    speakerId: string; // 对应 Role ID 或 User ID
    speakerName: string;
    type: ParticipantType;
    content: string; // 实际发言内容

    // 元数据：用于追溯思考链路
    metadata?: {
        platform?: string; // e.g., 'gpt-4', 'claude-3'
        stance?: Stance; // 当时的立场
        refersToId?: string; // 针对哪条消息进行的回复
    };
}

// 2. 本地上下文账本 (The Local Ledger)
// 这是所有角色共享的“世界状态”
export interface ContextLedger {
    sessionId: string;
    topic: string; // 当前讨论的核心议题
    status: "active" | "concluded";
    logs: LogEntry[]; // 线性历史记录
    globalSummary?: string; //为了节省Token，对过往历史的压缩摘要
}

// 3. 意图评估结果 (Intent Evaluation)
// 这是 MPCIP 协议的核心：模型决定是否发言的数据包
export interface IntentAnalysis {
    nodeId: string;
    shouldSpeak: boolean; // 核心决策：是否发言
    urgencyScore: number; // 0.0 - 1.0 紧迫度/相关度
    internalMonologue: string; // 模型的内心独白 (例如："A的观点有漏洞，我需要指出")
}

// 底层模型适配器配置 (区分 OpenAI, Anthropic, Ollama 等)
export interface ModelConfig {
    provider: "openai" | "anthropic" | "local_llama" | "custom";
    modelName: string;
    apiKey?: string;
    endpoint?: string; // 针对本地部署
    temperature?: number;
}

// 角色静态配置 (初始化时决定)
export interface RoleProfile {
    id: string;
    name: string; // 显示名称，如 "风控官 Bob"
    stance: Stance; // 立场
    description: string; // 人设描述，注入 System Prompt
    biasWeight: number; // 权重 (0-1)，用于加权决策
    modelConfig: ModelConfig;
}

// 角色行为接口
export interface ICognitiveNode {
    // 1. 感知与评估：观察账本，决定是否发言
    evaluate(ledger: ContextLedger): Promise<IntentAnalysis>;

    // 2. 表达与输出：生成实际回复
    speak(ledger: ContextLedger): Promise<LogEntry>;
}

import { ICognitiveNode, RoleProfile, ModelConfig } from "./interfaces";
import { ContextLedger, IntentAnalysis, LogEntry, Stance } from "./types";
import { v4 as uuidv4 } from "uuid"; // 需要安装 uuid 库

// 模拟的大模型调用服务 (你需要根据实际情况封装)
import { LLMService } from "./services/LLMService";

export class CognitiveNode implements ICognitiveNode {
    private profile: RoleProfile;
    private llmService: LLMService;

    constructor(profile: RoleProfile) {
        this.profile = profile;
        this.llmService = new LLMService(profile.modelConfig);
    }

    /**
     * 核心方法：评估阶段
     * 不生成最终回复，只生成 JSON 元数据
     */
    async evaluate(ledger: ContextLedger): Promise<IntentAnalysis> {
        // 1. 构建 Prompt，要求模型只进行思考评估
        const systemPrompt = `
      你现在的身份是: ${this.profile.name}。
      你的立场是: ${this.profile.stance}。
      你的设定: ${this.profile.description}。
      
      任务: 观察当前的对话历史，决定你是否需要发言。
      规则:
      1. 只有当讨论内容与你的立场冲突，或你需要补充关键信息时才发言。
      2. 如果之前的发言已经涵盖了你的观点，保持沉默。
      3. 返回 JSON 格式。
    `;

        // 2. 序列化最近的 N 条记录作为上下文
        const recentLogs = ledger.logs
            .slice(-5)
            .map((l) => `${l.speakerName}: ${l.content}`)
            .join("\n");
        const userPrompt = `
      当前议题: ${ledger.topic}
      最近记录:
      ${recentLogs}
      
      请分析并返回 JSON: { "shouldSpeak": boolean, "urgencyScore": number (0-1), "reason": string }
    `;

        // 3. 调用 LLM (强制 JSON 模式)
        const response = await this.llmService.callList(
            systemPrompt,
            userPrompt,
            { jsonMode: true }
        );
        const result = JSON.parse(response);

        return {
            nodeId: this.profile.id,
            shouldSpeak: result.shouldSpeak,
            urgencyScore: result.urgencyScore,
            internalMonologue: result.reason,
        };
    }

    /**
     * 核心方法：执行阶段
     * 生成最终回复内容
     */
    async speak(ledger: ContextLedger): Promise<LogEntry> {
        const systemPrompt = `
      你现在的身份是: ${this.profile.name} (${this.profile.stance})。
      请基于你的立场，对当前的议题发表明确、简洁的看法。
      不要重复自己之前的观点。
    `;

        // 这里通常需要更完整的历史记录
        const fullContext = ledger.logs
            .map((l: LogEntry) => `[${l.speakerName}]: ${l.content}`)
            .join("\n");

        const content = await this.llmService.callChat(
            systemPrompt,
            fullContext
        );

        return {
            id: uuidv4(),
            timestamp: Date.now(),
            speakerId: this.profile.id,
            speakerName: this.profile.name,
            type: "model",
            content: content,
            metadata: {
                platform: this.profile.modelConfig.provider,
                stance: this.profile.stance,
            },
        };
    }

    // 获取简要信息
    public getProfile() {
        return this.profile;
    }
}
