import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { RoleEntity } from './role.entity';

/**
 * Agent实体
 * 为解决特定问题而创建的解决方案，可以包含多个角色
 */
@Entity('agents', { comment: 'AI代理表' })
export class AgentEntity {
  /** Agent唯一标识符 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Agent名称，唯一 */
  @Column({ type: 'varchar', length: 100, unique: true, comment: 'Agent名称' })
  name: string;

  /** Agent描述 */
  @Column({ type: 'text', comment: 'Agent描述' })
  description: string;

  /** Agent目标 */
  @Column({ type: 'text', comment: 'Agent目标' })
  goal: string;

  /** Agent配置 */
  @Column({ type: 'jsonb', nullable: true, comment: 'Agent配置' })
  config: Record<string, any>;

  /** Agent是否激活 */
  @Column({ type: 'boolean', default: true, comment: 'Agent是否激活' })
  isActive: boolean;

  /** 关联的角色列表 */
  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'agent_roles',
    joinColumn: { name: 'agent_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  /** Agent订阅的事件列表 */
  @Column({ type: 'jsonb', default: [], comment: 'Agent订阅的事件列表' })
  subscribedEvents: string[];

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
