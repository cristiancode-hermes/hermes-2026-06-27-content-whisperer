import { Component, inject, signal, computed, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { SourceService } from '../services/source.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <header class="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-neutral-200 bg-surface px-4 dark:border-neutral-200/10 dark:bg-neutral-900">
      <!-- Mobile hamburger -->
      <button
        class="flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
        (click)="toggleSidebar.emit()"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo -->
      <a routerLink="/dashboard" class="flex items-center gap-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        <span class="text-xl">🔤</span>
        <span class="hidden sm:inline">Content Whisperer</span>
      </a>

      <!-- Search -->
      <div class="relative ml-auto max-w-md flex-1">
        <input
          #searchInput
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch()"
          (keydown)="onKeydown($event)"
          placeholder="Buscar análisis..."
          class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 pl-10 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <kbd class="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-neutral-200 bg-surface px-1.5 py-0.5 text-xs text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 sm:flex">
          <span>Ctrl</span><span>+</span><span>K</span>
        </kbd>
      </div>

      <!-- Theme toggle -->
      <button
        (click)="themeService.toggle()"
        class="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        aria-label="Toggle theme"
      >
        @if (themeService.isDark()) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        }
      </button>

      <!-- User menu -->
      <div class="relative" #menuContainer>
        <button
          (click)="menuOpen.set(!menuOpen())"
          class="flex items-center gap-2 rounded-lg p-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white">
            {{ userInitials() }}
          </div>
        </button>
        @if (menuOpen()) {
          <div class="absolute right-0 top-full mt-2 w-48 rounded-lg border border-neutral-200 bg-surface py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <div class="border-b border-neutral-200 px-4 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              {{ authService.currentUser()?.name ?? authService.currentUser()?.email }}
            </div>
            <button
              (click)="authService.logout(); menuOpen.set(false)"
              class="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly sourceService = inject(SourceService);

  protected readonly searchQuery = signal('');
  protected readonly menuOpen = signal(false);
  protected readonly searchResults = signal<any[]>([]);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  readonly toggleSidebar = output<void>();

  protected readonly userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return user.name
      ? user.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
      : user.email[0].toUpperCase();
  });

  protected onSearch(): void {
    clearTimeout(this.searchTimeout);
    const q = this.searchQuery().trim();
    if (q.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searchTimeout = setTimeout(async () => {
      try {
        this.searchResults.set(await this.sourceService.search(q));
      } catch {
        // ignore
      }
    }, 300);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const input = document.querySelector<HTMLInputElement>('header input[placeholder*="Buscar"]');
      input?.focus();
    }
  }
}
