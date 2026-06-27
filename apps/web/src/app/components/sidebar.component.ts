import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-neutral-200 bg-surface pt-16 transition-transform duration-200 dark:border-neutral-200/10 dark:bg-neutral-900 md:static md:translate-x-0"
      [class.-translate-x-full]="!isOpen()"
    >
      <nav class="flex flex-1 flex-col gap-1 p-4">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            (click)="navigated.emit()"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="border-t border-neutral-200 p-4 dark:border-neutral-700">
        <p class="text-xs text-neutral-400 dark:text-neutral-500">
          Content Whisperer v1.0
        </p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly isOpen = input(false);
  readonly navigated = output<void>();

  protected readonly navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/analyze', label: 'Nuevo Análisis', icon: '✨', exact: false },
    { path: '/sources', label: 'Historial', icon: '📄', exact: false },
    { path: '/collections', label: 'Colecciones', icon: '📁', exact: false },
  ];
}
