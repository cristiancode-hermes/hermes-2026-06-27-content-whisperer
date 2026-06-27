import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SourceService } from '../services/source.service';
import { CollectionService } from '../services/collection.service';
import { ToastService } from '../services/toast.service';
import { ConfirmModalComponent } from '../components/confirm-modal.component';
import type { Source } from '../models/source.model';
import type { Collection } from '../models/collection.model';

@Component({
  selector: 'app-source-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, ConfirmModalComponent],
  template: `
    <div class="page-enter mx-auto max-w-4xl space-y-6 p-6">
      @if (loading()) {
        <!-- Skeleton -->
        <div class="space-y-4">
          <div class="skeleton h-8 w-2/3"></div>
          <div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-64 rounded-xl"></div>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-surface p-12 dark:border-neutral-700 dark:bg-neutral-800">
          <p class="text-neutral-500 dark:text-neutral-400">Error al cargar el análisis</p>
          <button (click)="loadSource()" class="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600">
            Reintentar
          </button>
        </div>
      } @else if (source(); as s) {
        <!-- Back -->
        <a routerLink="/sources" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al historial
        </a>

        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span>{{ s.sourceType === 'url' ? '🌐' : '📝' }}</span>
              @if (editingTitle()) {
                <input
                  #titleInput
                  [(ngModel)]="editTitleValue"
                  (keydown.enter)="saveTitle()"
                  (blur)="saveTitle()"
                  (keydown.escape)="cancelEditTitle()"
                  class="flex-1 rounded-lg border border-primary-500 bg-neutral-50 px-3 py-1 text-lg font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-neutral-700 dark:text-neutral-200"
                />
              } @else {
                <h1
                  class="cursor-pointer text-xl font-bold text-neutral-800 hover:text-primary-600 dark:text-neutral-200 dark:hover:text-primary-400"
                  (click)="startEditTitle()"
                >
                  {{ s.title }}
                </h1>
                <button (click)="startEditTitle()" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              }
              <span class="shrink-0 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-500 dark:bg-accent-500/10 dark:text-accent-400">
                {{ s.mode }}
              </span>
            </div>
            <div class="mt-1 flex items-center gap-3 text-xs text-neutral-400">
              <span>{{ s.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              @if (s.analysisLength) {
                <span>· {{ s.analysisLength }}</span>
              }
              @if (s.originalUrl) {
                <a [href]="s.originalUrl" target="_blank" rel="noopener" class="truncate text-primary-500 hover:underline">{{ s.originalUrl }}</a>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex shrink-0 gap-2">
            <button
              (click)="showCollectionModal.set(true)"
              class="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              📁 Agregar a colección
            </button>
            <button
              (click)="exportMarkdown()"
              class="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              📥 Exportar MD
            </button>
            <button
              (click)="showDeleteConfirm.set(true)"
              class="rounded-lg border border-danger-200 px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 dark:border-danger-500/30 dark:hover:bg-danger-500/10"
            >
              🗑 Eliminar
            </button>
          </div>
        </div>

        <!-- Executive Summary -->
        @if (s.summary) {
          <div class="rounded-xl border border-neutral-200 bg-surface p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h2 class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Resumen ejecutivo</h2>
            <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{{ s.summary.executiveSummary }}</p>
            @if (s.summary.tone || s.summary.sentiment) {
              <div class="mt-4 flex gap-4 text-xs text-neutral-400">
                @if (s.summary.tone) {
                  <span>Tono: <span class="text-neutral-600 dark:text-neutral-300">{{ s.summary.tone }}</span></span>
                }
                @if (s.summary.sentiment) {
                  <span>Sentimiento: <span class="text-neutral-600 dark:text-neutral-300">{{ s.summary.sentiment }}</span></span>
                }
              </div>
            }
          </div>
        }

        <!-- Key Points -->
        @if (s.keyPoints && s.keyPoints.length > 0) {
          <div class="rounded-xl border border-neutral-200 bg-surface p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h2 class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Puntos clave</h2>
            <ul class="space-y-2">
              @for (kp of (s.keyPoints ?? []).sort((a,b) => a.sortOrder - b.sortOrder); track kp.id) {
                <li class="flex items-start gap-3 text-sm">
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">{{ kp.relevanceScore }}</span>
                  <span class="text-neutral-700 dark:text-neutral-300">{{ kp.text }}</span>
                </li>
              }
            </ul>
          </div>
        }

        <!-- Quotes -->
        @if (s.quotes && s.quotes.length > 0) {
          <div class="rounded-xl border border-neutral-200 bg-surface p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h2 class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Citas destacadas</h2>
            <div class="space-y-3">
              @for (q of (s.quotes ?? []).sort((a,b) => a.sortOrder - b.sortOrder); track q.id) {
                <blockquote class="border-l-4 border-primary-500 bg-neutral-50 pl-4 pr-4 py-3 text-sm italic text-neutral-700 dark:bg-neutral-700/50 dark:text-neutral-300">
                  <p>{{ q.text }}</p>
                  @if (q.attribution) {
                    <footer class="mt-2 text-xs not-italic text-neutral-400">— {{ q.attribution }}</footer>
                  }
                  @if (q.context) {
                    <p class="mt-1 text-xs not-italic text-neutral-400">{{ q.context }}</p>
                  }
                </blockquote>
              }
            </div>
          </div>
        }

        <!-- Stats -->
        @if (s.stats && s.stats.length > 0) {
          <div class="rounded-xl border border-neutral-200 bg-surface p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h2 class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Estadísticas</h2>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              @for (stat of (s.stats ?? []).sort((a,b) => a.sortOrder - b.sortOrder); track stat.id) {
                <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-700/50">
                  <p class="text-xs text-neutral-400">{{ stat.label }}</p>
                  <p class="mt-1 text-lg font-semibold text-neutral-800 dark:text-neutral-200">{{ stat.value }}</p>
                  @if (stat.context) {
                    <p class="text-xs text-neutral-400">{{ stat.context }}</p>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Original Content (collapsible) -->
        <div class="rounded-xl border border-neutral-200 bg-surface dark:border-neutral-700 dark:bg-neutral-800">
          <button
            (click)="showOriginal.set(!showOriginal())"
            class="flex w-full items-center justify-between p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-300"
          >
            Contenido original
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" [class.rotate-180]="showOriginal()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (showOriginal()) {
            <div class="border-t border-neutral-200 p-4 dark:border-neutral-700">
              <pre class="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 font-mono">{{ s.rawContent }}</pre>
            </div>
          }
        </div>

        <!-- Add to collection modal -->
        @if (showCollectionModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="showCollectionModal.set(false)">
            <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-surface p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800" (click)="$event.stopPropagation()">
              <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Agregar a colección</h3>
              <div class="mt-4 space-y-2">
                @for (col of collections(); track col.id) {
                  <button
                    (click)="addToCollection(col.id)"
                    class="flex w-full items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
                  >
                    <span>📁</span>
                    <span class="flex-1 text-neutral-700 dark:text-neutral-300">{{ col.name }}</span>
                    <span class="text-xs text-neutral-400">{{ col._count?.sources ?? 0 }} fuentes</span>
                  </button>
                }
              </div>
              @if (collections().length === 0) {
                <p class="py-4 text-center text-sm text-neutral-400">No hay colecciones disponibles. Crea una desde Colecciones.</p>
              }
              <button
                (click)="showCollectionModal.set(false)"
                class="mt-4 w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        }

        <!-- Delete confirm modal -->
        <app-confirm-modal
          [isOpen]="showDeleteConfirm()"
          title="Eliminar análisis"
          message="¿Estás seguro de eliminar este análisis? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          [destructive]="true"
          (confirmed)="deleteSource()"
          (cancelled)="showDeleteConfirm.set(false)"
        />
      }
    </div>
  `,
})
export class SourceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sourceService = inject(SourceService);
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);

  protected readonly source = signal<Source | null>(null);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly editingTitle = signal(false);
  protected readonly editTitleValue = signal('');
  protected readonly showOriginal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly showCollectionModal = signal(false);

  ngOnInit(): void {
    this.loadSource();
  }

  protected loadSource(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(true);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.sourceService.findOne(id)
      .then(s => this.source.set(s))
      .catch(() => this.error.set(true))
      .finally(() => this.loading.set(false));
  }

  protected startEditTitle(): void {
    this.editTitleValue.set(this.source()?.title ?? '');
    this.editingTitle.set(true);
  }

  protected async saveTitle(): Promise<void> {
    const s = this.source();
    if (!s) return;
    const newTitle = this.editTitleValue().trim();
    if (!newTitle || newTitle === s.title) {
      this.editingTitle.set(false);
      return;
    }
    try {
      const updated = await this.sourceService.update(s.id, { title: newTitle });
      this.source.set(updated);
      this.toastService.show('Título actualizado', 'success');
    } catch {
      this.toastService.show('Error al actualizar el título', 'error');
    }
    this.editingTitle.set(false);
  }

  protected cancelEditTitle(): void {
    this.editingTitle.set(false);
  }

  protected async deleteSource(): Promise<void> {
    const s = this.source();
    if (!s) return;
    try {
      await this.sourceService.remove(s.id);
      this.toastService.show('Análisis eliminado', 'success');
      await this.router.navigate(['/sources']);
    } catch {
      this.toastService.show('Error al eliminar el análisis', 'error');
    }
    this.showDeleteConfirm.set(false);
  }

  protected exportMarkdown(): void {
    const s = this.source();
    if (!s) return;
    let md = `# ${s.title}\n\n`;
    md += `**Tipo:** ${s.sourceType === 'url' ? 'URL' : 'Texto'}  \n`;
    md += `**Modo:** ${s.mode}  \n`;
    if (s.analysisLength) md += `**Extensión:** ${s.analysisLength}  \n`;
    if (s.originalUrl) md += `**Fuente:** ${s.originalUrl}  \n`;
    md += `**Fecha:** ${s.createdAt}  \n\n`;

    if (s.summary) {
      md += `## Resumen ejecutivo\n\n${s.summary.executiveSummary}\n\n`;
      if (s.summary.tone) md += `*Tono: ${s.summary.tone}*\n`;
      if (s.summary.sentiment) md += `*Sentimiento: ${s.summary.sentiment}*\n\n`;
    }

    if (s.keyPoints && s.keyPoints.length > 0) {
      md += `## Puntos clave\n\n`;
      for (const kp of s.keyPoints.sort((a, b) => a.sortOrder - b.sortOrder)) {
        md += `- [${kp.relevanceScore}] ${kp.text}\n`;
      }
      md += '\n';
    }

    if (s.quotes && s.quotes.length > 0) {
      md += `## Citas destacadas\n\n`;
      for (const q of s.quotes.sort((a, b) => a.sortOrder - b.sortOrder)) {
        md += `> ${q.text}\n`;
        if (q.attribution) md += `> — ${q.attribution}\n`;
        if (q.context) md += `> *${q.context}*\n`;
        md += '\n';
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.title.replace(/[^a-zA-Z0-9\s]/g, '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected async addToCollection(collectionId: number): Promise<void> {
    const s = this.source();
    if (!s) return;
    try {
      await this.collectionService.addSource(collectionId, s.id);
      this.toastService.show('Agregado a la colección', 'success');
      this.showCollectionModal.set(false);
    } catch {
      this.toastService.show('Error al agregar a la colección', 'error');
    }
  }
}
