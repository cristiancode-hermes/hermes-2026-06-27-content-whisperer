import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import type { User } from '../models/user.model';
import type { AuthResponse } from '../models/auth.model';

describe('AuthService', () => {
  let httpTesting: HttpTestingController;

  function setup(localStorageItems?: Record<string, string>) {
    localStorage.clear();
    if (localStorageItems) {
      for (const [key, value] of Object.entries(localStorageItems)) {
        localStorage.setItem(key, value);
      }
    }

    const routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    const service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router) as any;

    return { service, router };
  }

  afterEach(() => {
    httpTesting.verify();
  });

  describe('initial state', () => {
    it('should start with null user when no localStorage', () => {
      const { service } = setup();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should restore user from localStorage', () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const { service } = setup({ cw_user: JSON.stringify(user) });

      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('login', () => {
    it('should POST to /auth/login and set session', async () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const authRes: AuthResponse = { token: 'test-token', user };
      const { service } = setup();

      const loginPromise = service.login('test@test.com', 'password123');

      const req = httpTesting.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password123' });
      req.flush(authRes);

      await loginPromise;

      expect(localStorage.getItem('cw_token')).toBe('test-token');
      expect(localStorage.getItem('cw_user')).toBe(JSON.stringify(user));
      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('register', () => {
    it('should POST to /auth/register and set session', async () => {
      const user: User = {
        id: 2,
        email: 'new@test.com',
        name: 'New User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const authRes: AuthResponse = { token: 'register-token', user };
      const { service } = setup();

      const registerPromise = service.register('New User', 'new@test.com', 'password456');

      const req = httpTesting.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'New User',
        email: 'new@test.com',
        password: 'password456',
      });
      req.flush(authRes);

      await registerPromise;

      expect(localStorage.getItem('cw_token')).toBe('register-token');
      expect(localStorage.getItem('cw_user')).toBe(JSON.stringify(user));
      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear local storage and navigate to /login', () => {
      const user: User = {
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const { service, router } = setup({
        cw_token: 'some-token',
        cw_user: JSON.stringify(user),
      });

      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);

      service.logout();

      expect(localStorage.getItem('cw_token')).toBeNull();
      expect(localStorage.getItem('cw_user')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
