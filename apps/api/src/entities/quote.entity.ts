import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from './source.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sourceId' })
  sourceId: number;

  @ManyToOne(() => Source, s => s.quotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @Column({ type: 'text' })
  text: string;

  @Column({ length: 255, nullable: true })
  attribution: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({ default: 0 })
  sortOrder: number;
}
