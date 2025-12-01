/**
 * 通义AI响应数据类型定义
 */

/**
 * 通义AI响应根对象
 */
export interface TongyiContentItem {
    /** 内容文本 */
    content: string;
    /** 内容类型 */
    contentType?: string;
    /** 内容ID */
    id?: string;
    /** 是否为增量内容 */
    incremental?: boolean;
    /** 角色类型 */
    role?: string;
    /** 角色名称 */
    roleName?: string;
    /** 内容状态 */
    status?: string;
    /** 是否为网页搜索结果 */
    webSearch?: boolean;
}

export interface TongyiParams {
    /** 是否深度检索 */
    deepResearch?: boolean;
    /** 其他参数 */
    [key: string]: any;
}

export interface TongyiAIResponse {
    /** 是否有AI免责声明 */
    aiDisclaimer: boolean;
    /** 是否可反馈 */
    canFeedback: boolean;
    /** 是否可重新生成 */
    canRegenerate: boolean;
    /** 是否可分享 */
    canShare: boolean;
    /** 是否可展示 */
    canShow: boolean;
    /** 是否为增量响应 */
    incremental: boolean;
    /** 消息状态 */
    msgStatus: string;
    /** 是否通过校验 */
    passValue: boolean;
    /** 会话是否开启 */
    sessionOpen: boolean;
    /** 会话是否可分享 */
    sessionShare: boolean;
    /** 会话是否有新警告 */
    sessionWarnNew: boolean;
    /** 是否为网页搜索 */
    webSearch: boolean;
    /** 响应额外类型 */
    extraType: string;
    /** 通道类型 */
    channel?: string;
    /** 内容来源 */
    contentFrom?: string;
    /** 内容类型 */
    contentType?: string;
    /** 内容数组 */
    contents?: TongyiContentItem[];
    /** 消息ID */
    msgId: string;
    /** 会话ID */
    sessionId?: string;
    /** 父消息ID */
    parentMsgId?: string;
    /** 请求ID */
    requestId?: string;
    /** 额外参数 */
    params?: TongyiParams;
    /** 包ID */
    pkgId?: number;
    /** 跟踪ID */
    traceId?: string;
    /** 错误码 */
    errorCode?: string | null;
}
