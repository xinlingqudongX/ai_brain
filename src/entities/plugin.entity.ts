import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'plugin', comment: '插件表' })
export class PluginEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '插件名称',
  })
  plugin_name: string;

  /** 创建时间 */
  @Column({ type: 'integer', comment: '创建时间戳' })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'integer', comment: '更新时间戳' })
  updated_at: number;
}
