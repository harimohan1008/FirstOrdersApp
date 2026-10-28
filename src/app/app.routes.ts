import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';

/**
 * `title` is applied to document.title on every navigation, which is what screen readers
 * announce when a page changes. `data.roles` is read by roleGuard.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home | Angular Menu App',
    loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'orders',
    title: 'Orders | Angular Menu App',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'manager'] },
    loadComponent: () => import('./pages/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'products',
    title: 'Products | Angular Menu App',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'admin',
    title: 'Admin | Angular Menu App',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'login',
    title: 'Sign in | Angular Menu App',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forbidden',
    title: 'Access denied | Angular Menu App',
    loadComponent: () => import('./pages/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '**',
    title: 'Page not found | Angular Menu App',
    loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent),
  },
];
