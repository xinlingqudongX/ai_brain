import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'runtime', comment: '运行时表' })
export class RuntimeEntity {
  @PrimaryGeneratedColumn('uuid')
  runtime_id: string;

  /** 运行时数据 */
  @Column({ type: 'json', nullable: true })
  runtime_data: Record<string, any>;

  /** 创建时间 */
  @Column({ type: 'integer', comment: '创建时间戳' })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'integer', comment: '更新时间戳' })
  updated_at: number;
}
