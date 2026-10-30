import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { MenuItem, Role, Session } from './models';

const STORAGE_KEY = 'ams.session';

export type LoginResult = 'ok' | 'invalid' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  /** Calls POST /api/auth/login. 'invalid' = wrong credentials, 'error' = server unreachable or failed. */
  login(username: string, password: string): Observable<LoginResult> {
    return this.http.post<Session>('/api/auth/login', { username: username.trim(), password }).pipe(
      tap((session) => {
        this.session.set(session);
        this.persist(session);
      }),
      map((): LoginResult => 'ok'),
      catchError((err: HttpErrorResponse) => of<LoginResult>(err.status === 401 ? 'invalid' : 'error')),
    );
  }

  logout(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  hasRole(roles?: Role[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }
    const user = this.user();
    return !!user && roles.includes(user.role);
  }

  canAccess(item: Pick<MenuItem, 'auth' | 'roles'>): boolean {
    if (item.auth && !this.isAuthenticated()) {
      return false;
    }
    return this.hasRole(item.roles);
  }

  private persist(session: Session): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable */
    }
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
