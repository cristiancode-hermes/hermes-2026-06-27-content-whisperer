import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(c => c.LoginPageComponent) },
  { path: 'register', loadComponent: () => import('./pages/register.page').then(c => c.RegisterPageComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard.page').then(c => c.DashboardPageComponent), canActivate: [authGuard] },
  { path: 'analyze', loadComponent: () => import('./pages/analyze.page').then(c => c.AnalyzePageComponent), canActivate: [authGuard] },
  { path: 'sources', loadComponent: () => import('./pages/history.page').then(c => c.HistoryPageComponent), canActivate: [authGuard] },
  { path: 'sources/:id', loadComponent: () => import('./pages/source-detail.page').then(c => c.SourceDetailPageComponent), canActivate: [authGuard] },
  { path: 'collections', loadComponent: () => import('./pages/collections.page').then(c => c.CollectionsPageComponent), canActivate: [authGuard] },
  { path: 'collections/:id', loadComponent: () => import('./pages/collection-detail.page').then(c => c.CollectionDetailPageComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' },
];
