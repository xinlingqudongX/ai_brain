import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plugin_runtime', comment: '插件运行时表' })
export class PluginRuntimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '插件名称',
  })
  plugin_name: string;

  /** 运行时数据 */
  @Column({ type: 'json', default: () => "'{}'", comment: '运行时数据' })
  runtime_data: Record<string, any>;

  /** 创建时间 */
  @Column({ type: 'integer', comment: '创建时间戳' })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'integer', comment: '更新时间戳' })
  updated_at: number;
}
