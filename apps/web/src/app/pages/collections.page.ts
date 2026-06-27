import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../services/collection.service';
import { ToastService } from '../services/toast.service';
import type { Collection } from '../models/collection.model';

@Component({
  selector: 'app-collections-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-enter mx-auto max-w-5xl space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Colecciones</h1>
        <button
          (click)="showCreateModal.set(true)"
          class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
        >
          + Nueva colección
        </button>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-40 rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div class="skeleton mb-2 h-5 w-3/4"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <p class="text-neutral-500 dark:text-neutral-400">Error al cargar las colecciones</p>
          <button (click)="loadCollections()" class="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
            Reintentar
          </button>
        </div>
      } @else if (collections().length === 0) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-5xl">📁</span>
          <h2 class="mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">No hay colecciones</h2>
          <p class="mt-2 text-neutral-500 dark:text-neutral-400">Crea tu primera colección para organizar tus análisis.</p>
          <button (click)="showCreateModal.set(true)" class="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">
            Crear colección
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (col of collections(); track col.id) {
            <a
              [routerLink]="['/collections', col.id]"
              class="group rounded-xl border border-neutral-200 bg-surface p-5 transition-all hover:border-primary-500 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-500"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">{{ col.name }}</h3>
                  @if (col.description) {
                    <p class="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{{ col.description }}</p>
                  }
                </div>
                <span class="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  {{ col._count?.sources ?? 0 }}
                </span>
              </div>
              <div class="mt-4 text-xs text-neutral-400">
                {{ col._count?.sources === 1 ? '1 fuente' : (col._count?.sources ?? 0) + ' fuentes' }}
              </div>
            </a>
          }
        </div>
      }

      <!-- Create modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="showCreateModal.set(false)">
          <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-surface p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Nueva colección</h3>
            <div class="mt-4 space-y-4">
              <div>
                <label for="colName" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre</label>
                <input
                  id="colName"
                  [(ngModel)]="newName"
                  placeholder="Nombre de la colección"
                  class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                />
              </div>
              <div>
                <label for="colDesc" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Descripción (opcional)</label>
                <textarea
                  id="colDesc"
                  [(ngModel)]="newDescription"
                  placeholder="Describe el propósito de esta colección"
                  rows="3"
                  class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                ></textarea>
              </div>
            </div>
            @if (createError()) {
              <p class="mt-2 text-sm text-danger-500">{{ createError() }}</p>
            }
            <div class="mt-6 flex gap-3">
              <button
                (click)="showCreateModal.set(false)"
                class="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                (click)="createCollection()"
                [disabled]="creating()"
                class="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                @if (creating()) {
                  Creando...
                } @else {
                  Crear
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CollectionsPageComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);

  protected readonly collections = signal<Collection[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly showCreateModal = signal(false);
  protected readonly newName = signal('');
  protected readonly newDescription = signal('');
  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCollections();
  }

  protected loadCollections(): void {
    this.loading.set(true);
    this.error.set(false);
    this.collectionService.findAll()
      .then(c => this.collections.set(c))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }

  protected async createCollection(): Promise<void> {
    const name = this.newName().trim();
    if (!name) {
      this.createError.set('El nombre es obligatorio.');
      return;
    }
    this.creating.set(true);
    this.createError.set(null);
    try {
      await this.collectionService.create({ name, description: this.newDescription().trim() || undefined });
      this.toastService.show('Colección creada', 'success');
      this.showCreateModal.set(false);
      this.newName.set('');
      this.newDescription.set('');
      this.loadCollections();
    } catch {
      this.createError.set('Error al crear la colección.');
    } finally {
      this.creating.set(false);
    }
  }
}
