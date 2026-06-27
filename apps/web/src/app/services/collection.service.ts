import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import type { Collection } from '../models/collection.model';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly api = inject(ApiService);

  findAll(): Promise<Collection[]> {
    return this.api.get<Collection[]>('/collections');
  }

  findOne(id: number): Promise<Collection> {
    return this.api.get<Collection>(`/collections/${id}`);
  }

  create(data: { name: string; description?: string }): Promise<Collection> {
    return this.api.post<Collection>('/collections', data);
  }

  update(id: number, data: { name?: string; description?: string }): Promise<Collection> {
    return this.api.patch<Collection>(`/collections/${id}`, data);
  }

  remove(id: number): Promise<void> {
    return this.api.delete<void>(`/collections/${id}`);
  }

  addSource(collectionId: number, sourceId: number): Promise<Collection> {
    return this.api.post<Collection>(`/collections/${collectionId}/sources`, { sourceId });
  }

  removeSource(collectionId: number, sourceId: number): Promise<Collection> {
    return this.api.delete<Collection>(`/collections/${collectionId}/sources/${sourceId}`);
  }
}
