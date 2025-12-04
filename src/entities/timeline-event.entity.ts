import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AgentEntity } from './agent.entity';

export enum EventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum EventType {
  SCHEDULED = 'scheduled',
  INTERVAL = 'interval',
  CRON = 'cron',
  MANUAL = 'manual',
}

/**
 * 时间线事件实体
 * 用于定时生命周期事件通知Agent
 */
@Entity('timeline_events', { comment: '时间线事件表' })
export class TimelineEventEntity {
  /** 事件唯一标识符 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 事件名称 */
  @Column({ type: 'varchar', length: 100, comment: '事件名称' })
  name: string;

  /** 事件描述 */
  @Column({ type: 'text', nullable: true, comment: '事件描述' })
  description: string;

  /** 事件类型 */
  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.MANUAL,
    comment: '事件类型',
  })
  type: EventType;

  /** 事件状态 */
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
    comment: '事件状态',
  })
  status: EventStatus;

  /** 计划执行时间 */
  @Column({ type: 'timestamp', nullable: true, comment: '计划执行时间' })
  scheduledAt: Date | null;

  /** Cron表达式 */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Cron表达式',
  })
  cronExpression: string;

  /** 间隔秒数 */
  @Column({ type: 'integer', nullable: true, comment: '间隔秒数' })
  intervalSeconds: number;

  /** 事件上下文 */
  @Column({ type: 'jsonb', nullable: true, comment: '事件上下文' })
  context: Record<string, any>;

  /** 执行结果 */
  @Column({ type: 'jsonb', nullable: true, comment: '执行结果' })
  result: Record<string, any>;

  /** 错误信息 */
  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  error: string;

  /** 执行时间 */
  @Column({ type: 'timestamp', nullable: true, comment: '执行时间' })
  executedAt: Date;

  /** 完成时间 */
  @Column({ type: 'timestamp', nullable: true, comment: '完成时间' })
  completedAt: Date;

  /** 关联的Agent */
  @ManyToOne(() => AgentEntity, (agent) => agent.timelineEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  /** Agent ID */
  @Column({ name: 'agent_id', comment: '关联的Agent ID' })
  agentId: string;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
