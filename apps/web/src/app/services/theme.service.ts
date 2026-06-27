import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.loadTheme());

  constructor() {
    // Sync class on body whenever isDark changes
    effect(() => {
      const dark = this.isDark();
      if (dark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      localStorage.setItem('cw_theme', dark ? 'dark' : 'light');
    });
  }

  private loadTheme(): boolean {
    const stored = localStorage.getItem('cw_theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }
}
