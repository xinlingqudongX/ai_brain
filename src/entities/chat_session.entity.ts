import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'chat_session', comment: '会话表' })
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '会话名称',
  })
  session_name: string;

  /** 创建时间 */
  @Column({ type: 'integer', comment: '创建时间戳' })
  created_at: number;

  /** 更新时间 */
  @Column({ type: 'integer', comment: '更新时间戳' })
  updated_at: number;
}
