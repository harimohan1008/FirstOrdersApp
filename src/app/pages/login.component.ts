import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { UiService } from '../core/ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Sign in</h1>

    <form (ngSubmit)="submit()" novalidate class="login-form" aria-describedby="login-hint">
      <p id="login-hint">Try admin / admin123, manager / manager123 or customer / customer123.</p>

      @if (error()) {
        <p id="login-error" class="error" role="alert">{{ error() }}</p>
      }

      <div class="field">
        <label for="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          [(ngModel)]="username"
          [attr.aria-invalid]="error() ? 'true' : null"
          [attr.aria-describedby]="error() ? 'login-error' : null"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          [(ngModel)]="password"
          [attr.aria-invalid]="error() ? 'true' : null"
          [attr.aria-describedby]="error() ? 'login-error' : null"
        />
      </div>

      <button type="submit" class="btn primary" [disabled]="busy()">
        {{ busy() ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ui = inject(UiService);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly busy = signal(false);

  protected submit(): void {
    if (this.busy()) {
      return;
    }
    if (!this.username.trim() || !this.password) {
      this.error.set('Enter both a username and a password.');
      return;
    }

    this.busy.set(true);
    this.auth.login(this.username, this.password).subscribe((result) => {
      this.busy.set(false);

      if (result === 'invalid') {
        this.error.set('Incorrect username or password.');
        return;
      }
      if (result === 'error') {
        this.error.set('Could not reach the server. Check that the API is running and try again.');
        return;
      }

      this.error.set('');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      // Only allow in-app relative redirects.
      const target = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/home';
      this.router.navigateByUrl(target).then(() => {
        this.ui.announce(`Signed in as ${this.auth.user()?.displayName}.`);
      });
    });
  }
}
