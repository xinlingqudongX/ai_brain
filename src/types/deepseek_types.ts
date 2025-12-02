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