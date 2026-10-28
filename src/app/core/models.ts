export type Role = 'admin' | 'manager' | 'customer';

export const ALL_ROLES: Role[] = ['admin', 'manager', 'customer'];

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: Role;
}

export interface Session {
  user: User;
  token: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface Order {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface MenuItem {
  label: string;
  path: string;
  /** Requires a signed-in user. */
  auth: boolean;
  /** If set, user must have one of these roles. */
  roles?: Role[];
}
