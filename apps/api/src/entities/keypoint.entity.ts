import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from './source.entity';

@Entity('key_points')
export class KeyPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sourceId' })
  sourceId: number;

  @ManyToOne(() => Source, s => s.keyPoints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: 5 })
  relevanceScore: number;

  @Column({ default: 0 })
  sortOrder: number;
}
