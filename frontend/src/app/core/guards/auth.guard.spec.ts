import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  const setupGuard = (isAuth: boolean) => {
    const authMock = { isAuthenticated: signal(isAuth) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    return authMock;
  };

  it('allows authenticated users through', () => {
    setupGuard(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to /login', () => {
    setupGuard(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(tree)).toContain('/login');
  });
});
