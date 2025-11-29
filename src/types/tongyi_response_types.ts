/**
 * 通义AI响应数据类型定义
 */

/**
 * 通义AI响应根对象
 */
export interface TongyiAIResponse {
  /** 是否显示AI免责声明 */
  aiDisclaimer: boolean;
  
  /** 是否可以反馈 */
  canFeedback: boolean;
  
  /** 是否可以重新生成 */
  canRegenerate: boolean;
  
  /** 是否可以分享 */
  canShare: boolean;
  
  /** 是否可以显示 */
  canShow: boolean;
  
  /** 错误代码 */
  errorCode: string;
  
  /** 额外类型 */
  extraType: string;
  
  /** 是否增量返回 */
  incremental: boolean;
  
  /** 消息状态 */
  msgStatus: string;
  
  /** 是否传递值 */
  passValue: boolean;
  
  /** 会话是否开启 */
  sessionOpen: boolean;
  
  /** 会话是否可分享 */
  sessionShare: boolean;
  
  /** 会话是否有新警告 */
  sessionWarnNew: boolean;
  
  /** 是否启用网络搜索 */
  webSearch: boolean;
  
  /** 消息内容 */
  content?: string;
  
  /** 消息ID */
  msgId?: string;
  
  /** 会话ID */
  sessionId?: string;
  
  /** 父消息ID */
  parentMsgId?: string;
  
  /** 请求ID */
  requestId?: string;
}