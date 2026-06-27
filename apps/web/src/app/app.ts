import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { SidebarComponent } from './components/sidebar.component';
import { ToastComponent } from './components/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent],
  template: `
    @if (authService.isAuthenticated()) {
      <div class="flex h-screen flex-col overflow-hidden">
        <app-header (toggleSidebar)="sidebarOpen.set(!sidebarOpen())" />
        <div class="flex flex-1 overflow-hidden">
          <app-sidebar [isOpen]="sidebarOpen()" (navigated)="sidebarOpen.set(false)" />
          <main class="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
            <router-outlet />
          </main>
        </div>
      </div>
      <app-toast />
    } @else {
      <router-outlet />
      <app-toast />
    }
  `,
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  protected readonly sidebarOpen = signal(false);
}
