import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plugin_usage', comment: '插件使用表' })
export class PluginUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  usage_id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '插件名称',
  })
  plugin_name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '工具名称',
  })
  tool_name: string;

  @Column({
    type: 'json',
    comment: '工具参数',
    nullable: true,
  })
  tool_params: Record<string, any> | null;

  @Column({
    type: 'json',
    comment: '执行结果',
    nullable: true,
  })
  result: any;

  @Column({
    type: 'boolean',
    comment: '是否成功',
    default: true,
  })
  success: boolean;

  @Column({
    type: 'integer',
    comment: '执行时间(毫秒)',
    default: 0,
  })
  execution_time: number;

  @Column({
    type: 'text',
    comment: '错误信息',
    nullable: true,
  })
  error: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '会话ID',
    nullable: true,
  })
  session_id: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '用户ID',
    nullable: true,
  })
  user_id: string | null;

  /** 创建时间 */
  @Column({ type: 'integer', comment: '创建时间戳' })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'integer', comment: '更新时间戳' })
  updated_at: number;
}
