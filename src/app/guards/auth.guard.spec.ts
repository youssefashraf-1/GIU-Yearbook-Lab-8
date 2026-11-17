import { HttpErrorResponse } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of, tap, throwError } from 'rxjs';
import { User } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const user: User = { studentId: 1, name: 'Maya Hassan', email: 'maya@example.test' };
  const currentUser = signal<User | null>(null);
  const auth = {
    isLoggedIn: computed(() => currentUser() !== null),
    checkSession: vi.fn<() => Observable<User>>(),
  };

  beforeEach(() => {
    currentUser.set(null);
    auth.checkSession.mockReset();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows a signed-in user without checking the session', () => {
    currentUser.set(user);

    expect(runGuard()).toBe(true);
    expect(auth.checkSession).not.toHaveBeenCalled();
  });

  it('allows a user whose session is restored after a reload', async () => {
    auth.checkSession.mockReturnValue(of(user).pipe(tap((restored) => currentUser.set(restored))));

    expect(await firstValueFrom(runGuard() as Observable<boolean | UrlTree>)).toBe(true);
    expect(auth.checkSession).toHaveBeenCalledOnce();
  });

  it('redirects to login when the session check returns 401', async () => {
    auth.checkSession.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );

    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/login');
  });
});
