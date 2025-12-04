import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { CapabilityEntity } from './capability.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => CapabilityEntity, capability => capability.roles)
  @JoinTable({
    name: 'role_capabilities',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'capability_id', referencedColumnName: 'id' }
  })
  capabilities: CapabilityEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
