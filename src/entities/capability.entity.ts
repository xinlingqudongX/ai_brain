import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity';

/**
 * 能力实体
 * 代表AI系统中的一项能力，如数据库操作、代码审查等
 */
@Entity('capabilities', { comment: 'AI能力表' })
export class CapabilityEntity {
  /** 能力唯一标识符 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 能力名称，唯一 */
  @Column({ type: 'varchar', length: 100, unique: true, comment: '能力名称' })
  name: string;

  /** 能力描述 */
  @Column({ type: 'text', comment: '能力描述' })
  description: string;

  /** 能力提示词，用于指导AI行为 */
  @Column({ type: 'text', comment: '能力提示词' })
  prompt: string;

  /** 能力是否激活 */
  @Column({ type: 'boolean', default: true, comment: '能力是否激活' })
  isActive: boolean;

  /** 关联的角色列表 */
  @ManyToMany(() => RoleEntity, (role) => role.capabilities)
  roles: RoleEntity[];

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
