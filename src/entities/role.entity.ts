import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CapabilityEntity } from './capability.entity';

/**
 * 角色实体
 * 代表AI系统中的一个角色，如DBA、开发人员等
 */
@Entity('roles', { comment: 'AI角色表' })
export class RoleEntity {
  /** 角色唯一标识符 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 角色名称，唯一 */
  @Column({ type: 'varchar', length: 100, unique: true, comment: '角色名称' })
  name: string;

  /** 角色描述 */
  @Column({ type: 'text', comment: '角色描述' })
  description: string;

  /** 角色提示词，用于指导AI行为 */
  @Column({ type: 'text', comment: '角色提示词' })
  prompt: string;

  /** 角色是否激活 */
  @Column({ type: 'boolean', default: true, comment: '角色是否激活' })
  isActive: boolean;

  /** 关联的能力列表 */
  @ManyToMany(() => CapabilityEntity, (capability) => capability.roles)
  @JoinTable({
    name: 'role_capabilities',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'capability_id', referencedColumnName: 'id' },
  })
  capabilities: CapabilityEntity[];

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
