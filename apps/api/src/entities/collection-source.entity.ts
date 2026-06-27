import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection.entity';
import { Source } from './source.entity';

@Entity('collection_sources')
export class CollectionSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collectionId' })
  collectionId: number;

  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @Column({ name: 'sourceId' })
  sourceId: number;

  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @CreateDateColumn()
  addedAt: Date;
}
