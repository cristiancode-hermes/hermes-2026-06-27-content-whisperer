import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';
import type { DashboardStats, WordCount } from '../models/dashboard.model';
import type { Source } from '../models/source.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-enter mx-auto max-w-6xl space-y-6 p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Dashboard</h1>
        <a routerLink="/analyze" class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">
          + Nuevo Análisis
        </a>
      </div>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (_ of [1,2,3,4]; track _) {
            <div class="h-28 rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div class="skeleton mb-2 h-4 w-20"></div>
              <div class="skeleton h-8 w-16"></div>
            </div>
          }
        </div>
        <div class="skeleton h-64 rounded-xl"></div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <p class="text-neutral-500 dark:text-neutral-400">Error al cargar el dashboard</p>
          <button (click)="loadData()" class="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
            Reintentar
          </button>
        </div>
      } @else if (!stats() && !recentSources()) {
        <!-- Welcome / empty -->
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <span class="text-5xl">👋</span>
          <h2 class="mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">¡Bienvenido a Content Whisperer!</h2>
          <p class="mt-2 text-neutral-500 dark:text-neutral-400">Comienza analizando tu primer contenido.</p>
          <a routerLink="/analyze" class="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">
            Crear primer análisis
          </a>
        </div>
      } @else {
        <!-- Stat cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Fuentes analizadas</p>
            <p class="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-200">{{ stats()?.totalSources ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Colecciones</p>
            <p class="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-200">{{ stats()?.totalCollections ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Citas destacadas</p>
            <p class="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-200">{{ stats()?.totalQuotes ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Modos activos</p>
            <p class="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-200">{{ stats()?.activeModes ?? 0 }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Mode distribution donut -->
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 class="mb-4 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Distribución por modo</h3>
            @if (modeDistribution().length > 0) {
              <svg viewBox="0 0 200 200" class="mx-auto h-48 w-48">
                @for (slice of modeDistribution(); track slice.mode; let i = $index) {
                  <circle
                    cx="100" cy="100" r="80"
                    fill="none"
                    [attr.stroke]="donutColors[i % donutColors.length]"
                    stroke-width="30"
                    [attr.stroke-dasharray]="slice.percent + ' ' + (100 - slice.percent)"
                    [attr.transform]="'rotate(' + slice.offset + ' 100 100)'"
                    class="transition-all duration-500"
                  />
                }
              </svg>
              <div class="mt-4 flex flex-wrap justify-center gap-3">
                @for (slice of modeDistribution(); track slice.mode) {
                  <span class="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <span class="inline-block h-3 w-3 rounded-full" [style.background]="donutColors[$index % donutColors.length]"></span>
                    {{ slice.mode }} ({{ slice.count }})
                  </span>
                }
              </div>
            } @else {
              <p class="text-sm text-neutral-400">Sin datos aún</p>
            }
          </div>

          <!-- Monthly activity sparkline -->
          <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 class="mb-4 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Actividad mensual</h3>
            @if (monthlyActivity().length > 0) {
              <svg viewBox="0 0 300 100" class="h-32 w-full">
                @let maxVal = maxMonthly();
                @let pts = monthlyActivity();
                <polyline
                  [attr.points]="sparklinePoints(pts, maxVal)"
                  fill="none"
                  stroke="var(--color-primary-500)"
                  stroke-width="2"
                  class="transition-all duration-500"
                />
                @for (point of pts; track point.month; let i = $index) {
                  <circle
                    [attr.cx]="getPointX(i, pts.length)"
                    [attr.cy]="getPointY(+point.count, maxVal)"
                    r="3"
                    fill="var(--color-primary-500)"
                  />
                }
              </svg>
              <div class="mt-2 flex justify-between text-xs text-neutral-400">
                @for (point of monthlyActivity(); track point.month) {
                  <span>{{ point.month }}</span>
                }
              </div>
            } @else {
              <p class="text-sm text-neutral-400">Sin datos aún</p>
            }
          </div>
        </div>

        <!-- Recent sources -->
        <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Fuentes recientes</h3>
            <a routerLink="/sources" class="text-xs font-medium text-primary-500 hover:text-primary-600">Ver todas</a>
          </div>
          @if (recentSources() && recentSources()!.length > 0) {
            <div class="space-y-2">
              @for (source of recentSources()!; track source.id) {
                <a [routerLink]="['/sources', source.id]" class="flex items-center justify-between rounded-lg p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">{{ source.title }}</p>
                    <p class="mt-0.5 text-xs text-neutral-400">{{ source.sourceType === 'url' ? '🌐' : '📝' }} {{ source.createdAt | date:'short' }}</p>
                  </div>
                  <span class="ml-2 shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-500 dark:bg-accent-500/10 dark:text-accent-400">
                    {{ source.mode }}
                  </span>
                </a>
              }
            </div>
          } @else {
            <p class="text-sm text-neutral-400">No hay fuentes analizadas aún.</p>
          }
        </div>

        <!-- Top words -->
        <div class="rounded-xl border border-neutral-200 bg-surface p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <h3 class="mb-4 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Palabras más frecuentes</h3>
          @if (topWords() && topWords()!.length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (word of topWords()!; track word.word) {
                <span class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  {{ word.word }} <span class="ml-1 text-primary-400 dark:text-primary-500">({{ word.count }})</span>
                </span>
              }
            </div>
          } @else {
            <p class="text-sm text-neutral-400">Sin datos aún</p>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly recentSources = signal<Source[] | null>(null);
  protected readonly topWords = signal<WordCount[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly donutColors = ['#1c7ed6', '#7950f2', '#2f9e44', '#e67700', '#e03131'];

  protected readonly modeDistribution = computed(() => {
    const s = this.stats();
    if (!s?.modeDistribution) return [];
    const total = s.modeDistribution.reduce((sum, m) => sum + +m.count, 0);
    let offset = 0;
    return s.modeDistribution.map(m => {
      const percent = (+m.count / total) * 100;
      const slice = { ...m, percent, count: +m.count, offset };
      offset += percent * 3.6;
      return slice;
    });
  });

  protected readonly monthlyActivity = computed(() => this.stats()?.monthlyActivity ?? []);

  protected readonly maxMonthly = computed(() => {
    const act = this.monthlyActivity();
    if (act.length === 0) return 1;
    return Math.max(...act.map(a => +a.count), 1);
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(false);
    Promise.all([
      this.dashboardService.getStats(),
      this.dashboardService.getRecent(),
      this.dashboardService.getTopWords(),
    ])
      .then(([s, r, w]) => {
        this.stats.set(s);
        this.recentSources.set(r);
        this.topWords.set(w);
      })
      .catch(() => {
        this.error.set(true);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  protected sparklinePoints(data: { month: string; count: string }[], maxVal: number): string {
    if (data.length === 0) return '';
    const width = 300;
    const height = 100;
    const padding = { top: 10, bottom: 15, left: 30, right: 30 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    return data
      .map((d, i) => {
        const x = padding.left + (i * chartW) / Math.max(data.length - 1, 1);
        const y = padding.top + chartH - (+d.count / maxVal) * chartH;
        return `${x},${y}`;
      })
      .join(' ');
  }

  protected getPointX(index: number, total: number): number {
    return 30 + (index * (240 / Math.max(total - 1, 1)));
  }

  protected getPointY(value: number, maxVal: number): number {
    return 85 - ((value / maxVal) * 70);
  }
}
