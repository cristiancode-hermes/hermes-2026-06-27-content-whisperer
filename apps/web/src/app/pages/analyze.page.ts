import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../services/analysis.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-analyze-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-enter mx-auto max-w-3xl space-y-6 p-6">
      <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Nuevo Análisis</h1>

      <!-- Tabs -->
      <div class="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
        <button
          (click)="activeTab.set('text')"
          class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          [class]="activeTab() === 'text' ? 'bg-surface text-neutral-800 shadow-sm dark:bg-neutral-700 dark:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'"
        >
          📝 Texto
        </button>
        <button
          (click)="activeTab.set('url')"
          class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          [class]="activeTab() === 'url' ? 'bg-surface text-neutral-800 shadow-sm dark:bg-neutral-700 dark:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'"
        >
          🌐 URL
        </button>
      </div>

      <div class="rounded-xl border border-neutral-200 bg-surface p-6 dark:border-neutral-700 dark:bg-neutral-800">
        @if (activeTab() === 'text') {
          <!-- Text input -->
          <div>
            <div class="flex items-center justify-between">
              <label for="content" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Contenido</label>
              <span class="text-xs" [class.text-danger-500]="content().length > maxChars" [class.text-neutral-400]="content().length <= maxChars">
                {{ content().length }}/{{ maxChars }}
              </span>
            </div>
            <textarea
              id="content"
              [(ngModel)]="content"
              [maxLength]="maxChars"
              rows="10"
              class="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:placeholder-neutral-500"
              placeholder="Pega o escribe el texto que deseas analizar..."
            ></textarea>
          </div>
        } @else {
          <!-- URL input -->
          <div>
            <label for="url" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">URL</label>
            <input
              id="url"
              type="url"
              [(ngModel)]="url"
              class="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:placeholder-neutral-500"
              placeholder="https://ejemplo.com/articulo"
            />
          </div>
        }

        <!-- Mode selector -->
        <div class="mt-6">
          <label for="mode" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Modo de análisis</label>
          <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            @for (m of modes; track m.value) {
              <button
                (click)="mode.set(m.value)"
                class="rounded-lg border px-4 py-3 text-left text-sm transition-colors"
                [class]="mode() === m.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500'"
              >
                <span class="text-base">{{ m.icon }}</span>
                <p class="mt-1 font-medium">{{ m.label }}</p>
                <p class="mt-0.5 text-xs text-neutral-400">{{ m.desc }}</p>
              </button>
            }
          </div>
        </div>

        <!-- Length selector -->
        <div class="mt-6">
          <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Extensión</label>
          <div class="mt-2 flex gap-2">
            @for (l of lengths; track l.value) {
              <button
                (click)="analysisLength.set(l.value)"
                class="rounded-lg border px-4 py-2 text-sm transition-colors"
                [class]="analysisLength() === l.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500'"
              >
                {{ l.label }}
              </button>
            }
          </div>
        </div>

        @if (error()) {
          <div class="mt-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
            {{ error() }}
          </div>
        }

        <!-- Analyze button -->
        <button
          (click)="onAnalyze()"
          [disabled]="analyzing() || !canAnalyze()"
          class="mt-6 w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          @if (analyzing()) {
            <span class="inline-flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analizando...
            </span>
          } @else {
            ✨ Analizar contenido
          }
        </button>
      </div>
    </div>
  `,
})
export class AnalyzePageComponent {
  private readonly analysisService = inject(AnalysisService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly activeTab = signal<'text' | 'url'>('text');
  protected readonly content = signal('');
  protected readonly url = signal('');
  protected readonly mode = signal('general');
  protected readonly analysisLength = signal('medium');
  protected readonly analyzing = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly maxChars = 50000;

  protected readonly modes = [
    { value: 'general', label: 'General', icon: '📋', desc: 'Resumen completo' },
    { value: 'academic', label: 'Académico', icon: '🎓', desc: 'Enfoque formal' },
    { value: 'executive', label: 'Ejecutivo', icon: '💼', desc: 'Puntos clave' },
    { value: 'simplify', label: 'Simplificar', icon: '🔤', desc: 'Lenguaje simple' },
  ];

  protected readonly lengths = [
    { value: 'short', label: 'Corto' },
    { value: 'medium', label: 'Medio' },
    { value: 'long', label: 'Extenso' },
  ];

  protected readonly canAnalyze = computed(() => {
    if (this.activeTab() === 'text') return this.content().trim().length > 0;
    return this.url().trim().length > 0;
  });

  protected async onAnalyze(): Promise<void> {
    this.error.set(null);
    this.analyzing.set(true);
    try {
      let result;
      if (this.activeTab() === 'text') {
        result = await this.analysisService.analyzeText(this.content().trim(), this.mode(), this.analysisLength());
      } else {
        result = await this.analysisService.analyzeUrl(this.url().trim(), this.mode(), this.analysisLength());
      }
      this.toastService.show('Análisis completado con éxito', 'success');
      await this.router.navigate(['/sources', result.id]);
    } catch (err: any) {
      this.error.set(err?.error?.message || err?.message || 'Error al analizar el contenido.');
    } finally {
      this.analyzing.set(false);
    }
  }
}
