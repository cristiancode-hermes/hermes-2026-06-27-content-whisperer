import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="animate-slide-up flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
          [class]="getToastClass(toast.type)"
        >
          <span class="text-lg">{{ getToastIcon(toast.type) }}</span>
          <span>{{ toast.message }}</span>
          <button
            (click)="dismiss(toast.id)"
            class="ml-auto text-current opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.2s ease-out;
    }
  `],
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'border-success-500/30 bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
      case 'error': return 'border-danger-500/30 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400';
      case 'warning': return 'border-warning-500/30 bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
      default: return 'border-primary-500/30 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400';
    }
  }

  protected getToastIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  }

  protected dismiss(id: number): void {
    this.toastService.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
