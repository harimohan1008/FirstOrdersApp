import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Home</h1>

    @if (auth.user(); as user) {
      <p>
        Welcome back, <strong>{{ user.displayName }}</strong>. You are signed in with the
        <strong>{{ user.role }}</strong> role.
      </p>
    } @else {
      <p>
        You are browsing as a guest. <a routerLink="/login">Sign in</a> to see the Products, Orders and Admin areas
        your role allows.
      </p>
    }

    <section aria-labelledby="access-heading">
      <h2 id="access-heading">Who can see what</h2>
      <table>
        <caption>Menu access by role</caption>
        <thead>
          <tr>
            <th scope="col">Menu item</th>
            <th scope="col">Guest</th>
            <th scope="col">Customer</th>
            <th scope="col">Manager</th>
            <th scope="col">Admin</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Home</th><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">Orders</th><td>No</td><td>No</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">Products</th><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">Admin</th><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
        </tbody>
      </table>
    </section>

    <section aria-labelledby="demo-heading">
      <h2 id="demo-heading">Demo accounts</h2>
      <ul>
        <li><code>admin</code> / <code>admin123</code></li>
        <li><code>manager</code> / <code>manager123</code></li>
        <li><code>customer</code> / <code>customer123</code></li>
      </ul>
    </section>
  `,
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);
}
