# Frontend Architecture — Content Whisperer

## Signal Architecture

### State Management Pattern

All component state flows through Angular signals:

```
API Response → async/await → signal.set(data) → computed() → Template
```

### Signal Usage by Layer

| Layer | Signal Type | Examples |
|-------|-------------|----------|
| Component state | `signal()` | `loading`, `error`, `items`, `searchQuery` |
| Derived values | `computed()` | `charCount`, `isValid`, `filteredItems`, `doughnutData` |
| Component inputs | `input()` | `@Input()` replacement |
| Component outputs | `output()` | `@Output()` replacement |
| Two-way binding | `model()` | `content`, `open` (modals) |
| Service state | `signal()` | `currentUser`, `isDark`, `toasts` |

### Service Signal Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class SourceService {
  readonly sources = signal<Source[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async findAll(query?: any): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.api.get(`/sources`, query);
      this.sources.set(result.data);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Component Signal Pattern

```typescript
export class HistoryPageComponent {
  private readonly sourceService = inject(SourceService);
  readonly sources = this.sourceService.sources;
  readonly loading = this.sourceService.loading;
  readonly error = this.sourceService.error;
  readonly searchQuery = signal('');
  readonly typeFilter = signal<string>('');

  // Computed: filter client-side for instant feedback
  readonly filtered = computed(() => {
    let items = this.sources();
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      items = items.filter(s => s.title.toLowerCase().includes(q));
    }
    if (this.typeFilter()) {
      items = items.filter(s => s.sourceType === this.typeFilter());
    }
    return items;
  });
}
```

### Template Pattern (Loading/Error/Empty/Content)

```html
@if (loading()) {
  <div class="space-y-4">
    @for (_ of [1,2,3]; track $index) {
      <div class="skeleton h-24 rounded-lg"></div>
    }
  </div>
} @else if (error()) {
  <div class="text-center py-12">
    <p class="text-danger-500">{{ error() }}</p>
    <button (click)="load()" class="btn-primary mt-4">Reintentar</button>
  </div>
} @else if (sources().length === 0) {
  <div class="text-center py-16">
    <p class="text-neutral-400 text-lg">Aún no has analizado ningún contenido</p>
    <a routerLink="/analyze" class="btn-primary mt-4 inline-block">Analizar ahora</a>
  </div>
} @else {
  @for (source of sources(); track source.id) {
    <div class="...">{{ source.title }}</div>
  }
}
```

### Auth Flow

1. On app init, check localStorage for existing token
2. If token exists, call GET /api/auth/me to validate and populate user
3. AuthService exposes `currentUser` signal and `isAuthenticated` computed
4. ApiService reads token from localStorage for all HTTP requests
5. authGuard redirects to /login if not authenticated

### Dark Mode

ThemeService manages a `isDark` signal persisted to localStorage. When toggled:
- Adds/removes `dark` class on `<body>` element
- Tailwind CSS v4's `@custom-variant dark` handles all style overrides
- System preference detected on init via `prefers-color-scheme`

### Zoneless Notes

All components use `provideZonelessChangeDetection()`. Change detection is triggered automatically by signal changes — no `ChangeDetectorRef.detectChanges()` or `NgZone` needed. Effects are used only for side effects (localStorage writes in ThemeService).
