import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, Product, Role, User } from './models';

export type ProductInput = Omit<Product, 'id'>;
export type OrderInput = Omit<Order, 'id'>;

/**
 * Data service backed by the .NET API (via the dev proxy: /api -> http://localhost:5000).
 * The class name is kept so existing components keep working.
 * Use relative URLs: the interceptor only adds the bearer token to relative requests.
 */
@Injectable({ providedIn: 'root' })
export class DummyDataService {
  private readonly http = inject(HttpClient);

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }
  createProduct(product: ProductInput): Observable<Product> {
    return this.http.post<Product>('/api/products', product);
  }
  updateProduct(id: number, product: ProductInput): Observable<Product> {
    return this.http.put<Product>(`/api/products/${id}`, product);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`/api/products/${id}`);
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }
  createOrder(order: OrderInput): Observable<Order> {
    return this.http.post<Order>('/api/orders', order);
  }
  updateOrder(id: number, order: OrderInput): Observable<Order> {
    return this.http.put<Order>(`/api/orders/${id}`, order);
  }
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`/api/orders/${id}`);
  }

  // Users (admin)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
  updateUserRole(userId: number, role: Role): Observable<User> {
    return this.http.put<User>(`/api/users/${userId}/role`, { role });
  }
}
