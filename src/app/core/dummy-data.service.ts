import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';
import { Order, Product, Role, User } from './models';

/** Dummy data service: reads JSON from /assets/data and simulates network latency. */
@Injectable({ providedIn: 'root' })
export class DummyDataService {
  private readonly http = inject(HttpClient);
  private readonly latencyMs = 300;

  private users: User[] | null = null;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('assets/data/products.json').pipe(delay(this.latencyMs));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('assets/data/orders.json').pipe(delay(this.latencyMs));
  }

  getUsers(): Observable<User[]> {
    if (this.users) {
      return of(this.users).pipe(delay(this.latencyMs));
    }
    return this.http.get<User[]>('assets/data/users.json').pipe(
      delay(this.latencyMs),
      tap((users) => (this.users = users)),
    );
  }

  /** Pretend to save a role change. */
  updateUserRole(userId: number, role: Role): Observable<User | undefined> {
    this.users = (this.users ?? []).map((u) => (u.id === userId ? { ...u, role } : u));
    return of(this.users.find((u) => u.id === userId)).pipe(delay(this.latencyMs));
  }
}
