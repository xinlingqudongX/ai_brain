/**
 * DeepSeek会话创建响应的数据结构
 */
export interface DeepSeekCreateSessionResponse {
    code: number;
    msg: string;
    data: {
        biz_code: number;
        biz_msg: string;
        biz_data: {
            id: string; // 会话ID
            seq_id: number;
            agent: string;
            title: string | null;
            title_type: string;
            version: number;
            current_message_id: string | null;
            pinned: boolean;
            inserted_at: number;
            updated_at: number;
        };
    };
}

/**
 * DeepSeek会话信息
 */
export interface DeepSeekSession {
    id: string; // 会话ID
    seqId: number;
    agent: string;
    title: string | null;
    titleType: string;
    version: number;
    currentMessageId: string | null;
    pinned: boolean;
    insertedAt: number;
    updatedAt: number;
}
