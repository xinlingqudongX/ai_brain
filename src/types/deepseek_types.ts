/**
 * DeepSeek通用响应结构
 */
export interface DeepSeekResponse<T> {
    /** 响应状态码，0表示成功 */
    code: number;

    /** 响应消息，成功时通常为空字符串 */
    msg: string;

    /** 响应数据 */
    data: T;
}

/**
 * DeepSeek业务响应数据结构
 */
export interface DeepSeekBizData<T> {
    /** 业务状态码，0表示成功 */
    biz_code: number;

    /** 业务消息 */
    biz_msg: string;

    /** 业务数据 */
    biz_data: T;
}

/**
 * DeepSeek会话数据结构
 */
export interface DeepSeekSessionData {
    /** 会话ID，用于后续的聊天操作 */
    id: string;

    /** 会话序列ID */
    seq_id: number;

    /** 代理类型，通常为'chat' */
    agent: string;

    /** 会话标题，新会话时为null */
    title: string | null;

    /** 标题类型 */
    title_type: string;

    /** 会话版本 */
    version: number;

    /** 当前消息ID */
    current_message_id: string | null;

    /** 是否置顶 */
    pinned: boolean;

    /** 会话创建时间戳 */
    inserted_at: number;

    /** 会话更新时间戳 */
    updated_at: number;
}

/**
 * DeepSeek会话创建响应的数据结构
 */
export type DeepSeekCreateSessionResponse = DeepSeekResponse<DeepSeekBizData<DeepSeekSessionData>>;

/**
 * DeepSeek会话信息
 */
export interface DeepSeekSession {
    /** 会话ID */
    id: string;

    /** 会话序列ID */
    seqId: number;

    /** 代理类型 */
    agent: string;

    /** 会话标题 */
    title: string | null;

    /** 标题类型 */
    titleType: string;

    /** 会话版本 */
    version: number;

    /** 当前消息ID */
    currentMessageId: string | null;

    /** 是否置顶 */
    pinned: boolean;

    /** 会话创建时间戳 */
    insertedAt: number;

    /** 会话更新时间戳 */
    updatedAt: number;
}

/**
 * DeepSeek聊天消息请求体
 */
export interface DeepSeekChatMessageRequest {
    /** 会话ID */
    chat_session_id: string;
    
    /** 父消息ID */
    parent_message_id: number | null;
    
    /** 用户输入的提示 */
    prompt: string;
    
    /** 引用的文件IDs */
    ref_file_ids: string[];
    
    /** 是否启用深度思考 */
    thinking_enabled: boolean;
    
    /** 是否启用搜索 */
    search_enabled: boolean;
    
    /** 客户端流ID */
    client_stream_id: string;
}

/**
 * DeepSeek停止消息流请求体
 */
export interface DeepSeekStopStreamRequest {
    /** 会话ID */
    chat_session_id: string;
    
    /** 消息ID */
    message_id: number;
}

/**
 * DeepSeek停止消息流响应
 */
export interface DeepSeekStopStreamResponse {
    /** 是否成功 */
    success: boolean;
    
    /** 错误信息（如果有） */
    error?: string;
}

/**
 * DeepSeek POW挑战请求体
 */
export interface DeepSeekCreatePowChallengeRequest {
    /** 目标路径 */
    target_path: string;
}

/**
 * DeepSeek POW挑战数据
 */
export interface DeepSeekPowChallengeData {
    /** 算法 */
    algorithm: string;
    
    /** 挑战值 */
    challenge: string;
    
    /** 盐值 */
    salt: string;
    
    /** 签名 */
    signature: string;
    
    /** 难度 */
    difficulty: number;
    
    /** 过期时间戳 */
    expire_at: number;
    
    /** 过期时间间隔（毫秒） */
    expire_after: number;
    
    /** 目标路径 */
    target_path: string;
}

/**
 * DeepSeek POW挑战响应
 */
export interface DeepSeekCreatePowChallengeResponse extends DeepSeekResponse<DeepSeekBizData<{
    challenge: DeepSeekPowChallengeData;
}>> {}