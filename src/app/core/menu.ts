import { MenuItem } from './models';

/** Single source of truth for the navigation menu and route access rules. */
export const MENU: MenuItem[] = [
  { label: 'Home', path: '/home', auth: false },
  { label: 'Orders', path: '/orders', auth: true, roles: ['admin', 'manager'] },
  { label: 'Products', path: '/products', auth: true },
  { label: 'Admin', path: '/admin', auth: true, roles: ['admin'] },
];
