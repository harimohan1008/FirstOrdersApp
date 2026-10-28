import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Page not found</h1>
    <p>We could not find the page you were looking for.</p>
    <p><a routerLink="/home">Return to the home page</a></p>
  `,
})
export class NotFoundComponent {}
