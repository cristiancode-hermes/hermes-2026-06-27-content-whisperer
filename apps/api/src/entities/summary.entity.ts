import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Source } from './source.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sourceId', unique: true })
  sourceId: number;

  @OneToOne(() => Source, s => s.summary)
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column({ type: 'text' })
  executiveSummary: string;

  @Column({ length: 50, nullable: true })
  tone: string;

  @Column({ length: 20, nullable: true })
  sentiment: string;

  @CreateDateColumn()
  createdAt: Date;
}
