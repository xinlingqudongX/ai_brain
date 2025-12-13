import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SessionEntity } from './chat_session.entity';

@Entity({ name: 'chat_message', comment: '聊天消息表' })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
    comment: '会话ID',
  })
  session_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '消息角色 (user/assistant/system)',
  })
  role: 'user' | 'assistant' | 'system';

  @Column({
    type: 'text',
    nullable: false,
    comment: '消息内容',
  })
  content: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: '工具调用结果',
  })
  tool_calls?: any[] | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: '消息token数量',
  })
  tokens?: number;

  @Column({
    type: 'integer',
    nullable: true,
    comment: '执行时间(毫秒)',
  })
  execution_time?: number;

  /** 创建时间 */
  @Column({ type: 'int', default: () => Date.now() })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'int', default: () => Date.now() })
  updated_at: number;

  // 关联会话
  @ManyToOne(() => SessionEntity)
  @JoinColumn({ name: 'session_id' })
  session: SessionEntity;
}