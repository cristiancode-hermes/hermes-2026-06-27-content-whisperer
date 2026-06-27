import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-900">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">🔤 Content Whisperer</h1>
          <p class="mt-2 text-neutral-500 dark:text-neutral-400">Crea tu cuenta</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="rounded-xl border border-neutral-200 bg-surface p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          @if (error()) {
            <div class="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
              {{ error() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nombre</label>
              <input
                id="name"
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Contraseña</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="new-password"
                class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                placeholder="Mín. 8 caracteres"
              />
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          @if (validationErrors().length > 0) {
            <div class="mt-4 space-y-1">
              @for (err of validationErrors(); track err) {
                <p class="text-xs text-danger-500">{{ err }}</p>
              }
            </div>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="mt-6 w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            @if (loading()) {
              <span class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando cuenta...
              </span>
            } @else {
              Crear cuenta
            }
          </button>

          <p class="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="font-medium text-primary-500 hover:text-primary-600">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly validationErrors = signal<string[]>([]);

  protected async onSubmit(): Promise<void> {
    this.validationErrors.set([]);
    this.error.set(null);

    const errors: string[] = [];
    if (!this.name().trim()) errors.push('El nombre es obligatorio.');
    if (!this.email().trim()) errors.push('El email es obligatorio.');
    if (this.password().length < 8) errors.push('La contraseña debe tener al menos 8 caracteres.');
    if (this.password() !== this.confirmPassword()) errors.push('Las contraseñas no coinciden.');

    if (errors.length > 0) {
      this.validationErrors.set(errors);
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.register(this.name().trim(), this.email().trim(), this.password());
      await this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err?.error?.message || err?.message || 'Error al crear la cuenta.');
    } finally {
      this.loading.set(false);
    }
  }
}
