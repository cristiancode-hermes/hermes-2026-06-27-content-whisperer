import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CollectionService } from '../services/collection.service';
import { ToastService } from '../services/toast.service';
import { ConfirmModalComponent } from '../components/confirm-modal.component';
import type { Collection } from '../models/collection.model';

@Component({
  selector: 'app-collection-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmModalComponent],
  template: `
    <div class="page-enter mx-auto max-w-5xl space-y-6 p-6">
      @if (loading()) {
        <div class="space-y-4">
          <div class="skeleton h-8 w-2/3"></div>
          <div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-48 rounded-xl"></div>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <p class="text-neutral-500 dark:text-neutral-400">Error al cargar la colección</p>
          <button (click)="loadCollection()" class="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
            Reintentar
          </button>
        </div>
      } @else if (collection(); as col) {
        <!-- Back -->
        <a routerLink="/collections" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a colecciones
        </a>

        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{{ col.name }}</h1>
            @if (col.description) {
              <p class="mt-1 text-neutral-500 dark:text-neutral-400">{{ col.description }}</p>
            }
            <p class="mt-1 text-sm text-neutral-400">
              {{ col._count?.sources === 1 ? '1 fuente' : (col._count?.sources ?? 0) + ' fuentes' }}
            </p>
          </div>
          <button
            (click)="showDeleteConfirm.set(true)"
            class="rounded-lg border border-danger-200 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 dark:border-danger-500/30 dark:hover:bg-danger-500/10"
          >
            🗑 Eliminar colección
          </button>
        </div>

        <!-- Sources list -->
        @if (sources().length > 0) {
          <div class="space-y-2">
            @for (source of sources(); track source.id) {
              <div class="flex items-center justify-between rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <a [routerLink]="['/sources', source.id]" class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span>{{ source.sourceType === 'url' ? '🌐' : '📝' }}</span>
                    <h3 class="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">{{ source.title }}</h3>
                    <span class="shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-500 dark:bg-accent-500/10 dark:text-accent-400">{{ source.mode }}</span>
                  </div>
                  @if (source.summary?.executiveSummary) {
                    <p class="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{{ source.summary.executiveSummary }}</p>
                  }
                  <p class="mt-1 text-xs text-neutral-400">{{ source.createdAt | date:'dd MMM yyyy' }}</p>
                </a>
                <button
                  (click)="removeSource(source.id)"
                  class="ml-4 shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-danger-50 hover:text-danger-500 dark:hover:bg-danger-500/10"
                  title="Eliminar de la colección"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            }
          </div>
        } @else {
          <!-- Empty state -->
          <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
            <span class="text-5xl">📂</span>
            <h2 class="mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">Colección vacía</h2>
            <p class="mt-2 text-neutral-500 dark:text-neutral-400">Agrega fuentes desde el detalle de análisis.</p>
            <a routerLink="/sources" class="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">
              Ir al historial
            </a>
          </div>
        }

        <!-- Delete confirm modal -->
        <app-confirm-modal
          [isOpen]="showDeleteConfirm()"
          title="Eliminar colección"
          message="¿Estás seguro de eliminar esta colección? Las fuentes no se eliminarán, solo se desvincularán."
          confirmText="Eliminar"
          [destructive]="true"
          (confirmed)="deleteCollection()"
          (cancelled)="showDeleteConfirm.set(false)"
        />
      }
    </div>
  `,
})
export class CollectionDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);

  protected readonly collection = signal<Collection | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly showDeleteConfirm = signal(false);

  protected readonly sources = computed(() => this.collection()?.sources ?? []);

  ngOnInit(): void {
    this.loadCollection();
  }

  protected loadCollection(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(true);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.collectionService.findOne(id)
      .then(c => this.collection.set(c))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }

  protected async removeSource(sourceId: number): Promise<void> {
    const col = this.collection();
    if (!col) return;
    try {
      const updated = await this.collectionService.removeSource(col.id, sourceId);
      this.collection.set(updated);
      this.toastService.show('Fuente eliminada de la colección', 'success');
    } catch {
      this.toastService.show('Error al eliminar la fuente de la colección', 'error');
    }
  }

  protected async deleteCollection(): Promise<void> {
    const col = this.collection();
    if (!col) return;
    try {
      await this.collectionService.remove(col.id);
      this.toastService.show('Colección eliminada', 'success');
      await this.router.navigate(['/collections']);
    } catch {
      this.toastService.show('Error al eliminar la colección', 'error');
    }
    this.showDeleteConfirm.set(false);
  }
}
