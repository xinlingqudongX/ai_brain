
/**
 * 通义千问模型系列
 */
export interface TongyiModelSeries {
    modelSeries: string;
    params: TongyiModelParam[];
}

/**
 * 通义千问模型参数
 */
export interface TongyiModelParam {
    newTag?: boolean;
    modelName: string;
    capsule: TongyiModelCapsule[];
    expanded: boolean;
    picked: boolean;
    modelCode: string;
    describe: string;
    order: number;
}

/**
 * 通义千问模型功能胶囊
 */
export interface TongyiModelCapsule {
    code: string;
    enable: boolean;
}

/**
 * 通义千问获取模型函数的返回类型
 */
export interface TongyiModelsResponse {
    success: boolean;
    httpCode: number;
    errorCode: string | null;
    errorMsg: string | null;
    data: TongyiModelSeries[];
    traceId: string;
    failed: boolean;
}

/**
 * 通义千问会话参数
 */
export interface TongyiSessionParams {
    /** 深度思考功能开关 */
    deepThink?: boolean;
    /** 搜索类型，"off"表示关闭联网搜索 */
    searchType?: string;
    /** 指定模型 */
    specifiedModel: string;
    /** 最近使用的模型列表 */
    lastUseModelList: string[];
    /** 记录的模型名称 */
    recordModelName: string;
    /** 业务场景信息 */
    bizSceneInfo: Record<string, any>;
    /** 温度参数，控制生成文本的随机性 */
    temperature?: number;
    /** 最大令牌数 */
    maxTokens?: number;
    /** 核采样参数 */
    topP?: number;
    /** 上下文限制 */
    contextLimit?: number;
}

/**
 * 通义千问消息内容扩展参数
 */
export interface TongyiMessageExt {
    /** 深度思考功能开关 */
    deepThink?: boolean;
    /** 其他扩展参数 */
    [key: string]: any;
}

/**
 * 通义千问消息内容
 */
export interface TongyiMessageContent {
    /** 消息内容 */
    content: string;
    /** 内容类型 */
    contentType: string;
    /** 角色：user/system */
    role: string;
    /** 扩展参数 */
    ext?: TongyiMessageExt;
}

/**
 * 通义千问对话请求体
 */
export interface TongyiConversationRequest {
    /** 会话ID */
    sessionId: string;
    /** 会话类型 */
    sessionType: string;
    /** 父消息ID */
    parentMsgId: string;
    /** 模型 */
    model: string;
    /** 模式 */
    mode: string;
    /** 用户操作 */
    userAction: string;
    /** 操作来源 */
    actionSource: string;
    /** 消息内容 */
    contents: TongyiMessageContent[];
    /** 动作 */
    action: string;
    /** 请求ID */
    requestId: string;
    /** 参数 */
    params: TongyiSessionParams;
}

/**
 * 通义千问压缩模型数据类型定义
 */
export interface CompressedTongyiModel {
  /** 模型描述 */
  describe: string;
  /** 功能胶囊对象，键为功能代码，值为是否启用 */
  capsule: Record<string, boolean>;
  /** 模型代码 */
  modelCode: string;
  /** 是否展开 */
  expanded: boolean;
  /** 是否已选择 */
  picked: boolean;
  /** 排序 */
  order: number;
  /** 新标签（可选） */
  newTag?: boolean;
}

/**
 * 通义千问压缩模型数据对象
 */
export const TongyiModels = {
  "tongyi-qwen3-max-model": {
    describe: "通义千问系列中最强大的语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Max",
    expanded: true,
    picked: true,
    order: 1
  },
  "tongyi-qwen3-max-thinking": {
    describe: "专为复杂推理与深度思考优化的模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Max-Thinking-Preview",
    expanded: true,
    picked: false,
    order: 2,
    newTag: true
  },
  "tongyi-qwen-plus-latest": {
    describe: "效果与性能均衡的全能语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Plus",
    expanded: true,
    picked: false,
    order: 3
  },
  "tongyi-qwen3-vl-235b-a22b": {
    describe: "基于Qwen3的强大多模态语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-VL-235B-A22B",
    expanded: true,
    picked: false,
    order: 4
  },
  "tongyi-qwen3-coder": {
    describe: "一个能够完成长期任务的强大编程代理",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Coder",
    expanded: true,
    picked: false,
    order: 5
  },
  "tongyi-qwen3-vl-32b": {
    describe: "Qwen3-VL系列中一款功能强大的稠密型视觉语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-VL-32B",
    expanded: true,
    picked: false,
    order: 6
  },
  "tongyi-qwen3-vl-30b-a3b-instruct": {
    describe: "一种紧凑且高性能的视觉语言混合专家（MoE）模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-VL-30B-A3B",
    expanded: false,
    picked: false,
    order: 7
  },
  "tongyi-qwen3-omni-flash": {
    describe: "基于Qwen3的原生全模态大语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Omni-Flash",
    expanded: false,
    picked: false,
    order: 8
  },
  "tongyi-qwen3-next-80b-a3b": {
    describe: "一款采用稀疏MoE和混合注意力机制的下一代模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Next-80B-A3B",
    expanded: false,
    picked: false,
    order: 9
  },
  "tongyi-qwen3-235b-a22b-instruct-2507": {
    describe: "最强大的混合专家语言模型",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-235B-A22B-2507",
    expanded: false,
    picked: false,
    order: 10
  },
  "tongyi-qwen3-30b-a3b-instruct-2507": {
    describe: "一个紧凑且高性能的混合专家（MoE模型）",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-30B-A3B-2507",
    expanded: false,
    picked: false,
    order: 11
  },
  "tongyi-qwen3-coder-flash": {
    describe: "闪电般的速度和准确的代码生成",
    capsule: {
      deep_think: true,
      analysis_research: true,
      image: true,
      code: true,
      translate: true,
      ppt: true,
      command: true
    },
    modelCode: "Qwen3-Coder-Flash",
    expanded: false,
    picked: false,
    order: 12
  }
} as const;

export type TongyiModelKey = keyof typeof TongyiModels;
