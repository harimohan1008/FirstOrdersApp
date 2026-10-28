import { Injectable, computed, signal } from '@angular/core';
import { MenuItem, Role, Session, User } from './models';

const STORAGE_KEY = 'ams.session';

/** Demo credentials only. A real app would validate against a server. */
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  admin: { password: 'admin123', user: { id: 1, username: 'admin', displayName: 'Alice Admin', role: 'admin' } },
  manager: { password: 'manager123', user: { id: 2, username: 'manager', displayName: 'Mark Manager', role: 'manager' } },
  customer: { password: 'customer123', user: { id: 3, username: 'customer', displayName: 'Cara Customer', role: 'customer' } },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<Session | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  login(username: string, password: string): boolean {
    const account = DEMO_ACCOUNTS[username.trim().toLowerCase()];
    if (!account || account.password !== password) {
      return false;
    }
    const session: Session = { user: account.user, token: `dummy-jwt-${account.user.role}` };
    this.session.set(session);
    this.persist(session);
    return true;
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
