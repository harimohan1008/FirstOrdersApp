import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Access denied</h1>
    <p>
      Your role
      @if (auth.user(); as user) {
        (<strong>{{ user.role }}</strong>)
      }
      does not have permission to view that page.
    </p>
    <p><a routerLink="/home">Return to the home page</a></p>
  `,
})
export class ForbiddenComponent {
  protected readonly auth = inject(AuthService);
}
