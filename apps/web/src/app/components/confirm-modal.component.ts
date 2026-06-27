import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-surface p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
          <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            {{ title() }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ message() }}
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              (click)="cancel()"
              class="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Cancelar
            </button>
            <button
              (click)="confirm()"
              class="rounded-lg px-4 py-2 text-sm font-medium text-white"
              [class]="destructive() ? 'bg-danger-500 hover:bg-danger-600' : 'bg-primary-500 hover:bg-primary-600'"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly isOpen = input(false);
  readonly title = input('¿Estás seguro?');
  readonly message = input('Esta acción no se puede deshacer.');
  readonly confirmText = input('Confirmar');
  readonly destructive = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected confirm(): void {
    this.confirmed.emit();
  }
}
