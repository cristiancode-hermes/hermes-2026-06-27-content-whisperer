import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Summary } from './summary.entity';
import { KeyPoint } from './keypoint.entity';
import { Quote } from './quote.entity';
import { Stat } from './stat.entity';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 10 })
  sourceType: string;

  @Column({ length: 2048, nullable: true })
  originalUrl: string;

  @Column({ type: 'text' })
  rawContent: string;

  @Column({ length: 20, default: 'general' })
  mode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  analysisLength: string;

  @CreateDateColumn()
  analyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Summary, s => s.source, { cascade: true })
  summary: Summary;

  @OneToMany(() => KeyPoint, k => k.source, { cascade: true })
  keyPoints: KeyPoint[];

  @OneToMany(() => Quote, q => q.source, { cascade: true })
  quotes: Quote[];

  @OneToMany(() => Stat, s => s.source, { cascade: true })
  stats: Stat[];
}
