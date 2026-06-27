import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from './source.entity';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sourceId' })
  sourceId: number;

  @ManyToOne(() => Source, s => s.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column({ length: 255 })
  label: string;

  @Column({ length: 255 })
  value: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ default: 0 })
  sortOrder: number;
}
