import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SourceService } from '../services/source.service';
import { CollectionService } from '../services/collection.service';
import type { Source } from '../models/source.model';
import type { Collection } from '../models/collection.model';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="page-enter mx-auto max-w-5xl space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Historial</h1>
        <a routerLink="/analyze" class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
          + Nuevo Análisis
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Buscar por título..."
            class="w-full rounded-lg border border-neutral-200 bg-surface px-4 py-2.5 pl-10 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500"
          />
        </div>
        <select
          [(ngModel)]="typeFilter"
          (ngModelChange)="onTypeChange()"
          class="rounded-lg border border-neutral-200 bg-surface px-4 py-2.5 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <option value="">Todos los tipos</option>
          <option value="text">📝 Texto</option>
          <option value="url">🌐 URL</option>
        </select>
      </div>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="space-y-3">
          @for (_ of [1,2,3,4,5]; track _) {
            <div class="h-24 rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div class="skeleton mb-2 h-4 w-3/4"></div>
              <div class="skeleton h-3 w-1/2"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <p class="text-neutral-500 dark:text-neutral-400">Error al cargar el historial</p>
          <button (click)="loadSources()" class="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
            Reintentar
          </button>
        </div>
      } @else if (sources().length === 0 && !searchQuery().trim()) {
        <!-- Empty -->
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-5xl">📄</span>
          <h2 class="mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">Aún no hay análisis</h2>
          <p class="mt-2 text-neutral-500 dark:text-neutral-400">Comienza analizando tu primer contenido.</p>
          <a routerLink="/analyze" class="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">
            Crear primer análisis
          </a>
        </div>
      } @else if (sources().length === 0) {
        <!-- Search empty -->
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-5xl">🔍</span>
          <h2 class="mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">Sin resultados</h2>
          <p class="mt-2 text-neutral-500 dark:text-neutral-400">No se encontraron fuentes con "{{ searchQuery() }}"</p>
        </div>
      } @else {
        <!-- Source list -->
        <div class="space-y-2">
          @for (source of sources(); track source.id) {
            <a [routerLink]="['/sources', source.id]" class="block rounded-xl border border-neutral-200 bg-surface p-4 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span>{{ source.sourceType === 'url' ? '🌐' : '📝' }}</span>
                    <h3 class="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">{{ source.title }}</h3>
                    <span class="shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-500 dark:bg-accent-500/10 dark:text-accent-400">{{ source.mode }}</span>
                  </div>
                  @if (source.summary?.executiveSummary) {
                    <p class="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {{ source.summary.executiveSummary }}
                    </p>
                  }
                  <div class="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                    <span>{{ source.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
                    @if (source.collections) {
                      @for (col of source.collections; track col.id) {
                        <span class="rounded bg-primary-50 px-1.5 py-0.5 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">{{ col.name }}</span>
                      }
                    }
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-1 h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2">
            <button
              (click)="goToPage(currentPage() - 1)"
              [disabled]="currentPage() <= 1"
              class="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Anterior
            </button>
            <span class="text-sm text-neutral-500">
              Página {{ currentPage() }} de {{ totalPages() }}
            </span>
            <button
              (click)="goToPage(currentPage() + 1)"
              [disabled]="currentPage() >= totalPages()"
              class="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Siguiente
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class HistoryPageComponent implements OnInit {
  private readonly sourceService = inject(SourceService);

  protected readonly sources = signal<Source[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly total = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly limit = signal(10);
  protected readonly searchQuery = signal('');
  protected readonly typeFilter = signal('');

  private searchTimeout?: ReturnType<typeof setTimeout>;

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

  ngOnInit(): void {
    this.loadSources();
  }

  protected loadSources(): void {
    this.loading.set(true);
    this.error.set(false);
    this.sourceService.findAll({
      page: this.currentPage(),
      limit: this.limit(),
      search: this.searchQuery().trim() || undefined,
      sourceType: this.typeFilter() || undefined,
    })
      .then(res => {
        this.sources.set(res.data);
        this.total.set(res.total);
      })
      .catch(() => {
        this.error.set(true);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadSources();
  }

  protected onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadSources();
    }, 300);
  }

  protected onTypeChange(): void {
    this.currentPage.set(1);
    this.loadSources();
  }
}
