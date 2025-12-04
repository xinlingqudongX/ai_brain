import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 时间线通知器实体
 * 定义定时任务，广播事件给订阅的Agent
 */
@Entity('timeline_notifiers', { comment: '时间线通知器表' })
export class TimelineNotifierEntity {
  /** 通知器唯一标识符 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 事件名称，唯一 */
  @Column({ type: 'varchar', length: 100, unique: true, comment: '事件名称' })
  eventName: string;

  /** 事件描述 */
  @Column({ type: 'text', comment: '事件描述' })
  description: string;

  /** Cron 表达式 */
  @Column({ type: 'varchar', length: 100, comment: 'Cron表达式' })
  cronExpression: string;

  /** 是否启用 */
  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isEnabled: boolean;

  /** 事件上下文数据 */
  @Column({ type: 'jsonb', nullable: true, comment: '事件上下文数据' })
  context: Record<string, any>;

  /** 最后执行时间 */
  @Column({ type: 'timestamp', nullable: true, comment: '最后执行时间' })
  lastExecutedAt: Date | null;

  /** 下次执行时间 */
  @Column({ type: 'timestamp', nullable: true, comment: '下次执行时间' })
  nextExecutionAt: Date | null;

  /** 执行次数 */
  @Column({ type: 'integer', default: 0, comment: '执行次数' })
  executionCount: number;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
