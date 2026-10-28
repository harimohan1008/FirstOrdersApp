import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth.service';
import { MENU } from './core/menu';
import { UiService } from './core/ui.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <a class="skip-link" href="#main-content" (click)="skipToMain($event)">Skip to main content</a>

    <header class="site-header">
      <a class="brand" routerLink="/home" aria-label="Angular Menu App, home">Angular Menu App</a>

      <nav aria-label="Main">
        <ul class="menu">
          @for (item of visibleMenu(); track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                ariaCurrentWhenActive="page"
                [routerLinkActiveOptions]="{ exact: false }"
                >{{ item.label }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <div class="account">
        @if (auth.user(); as user) {
          <span class="who">{{ user.displayName }} <span class="role-badge">{{ user.role }}</span></span>
          <button type="button" class="btn" (click)="logout()">Sign out</button>
        } @else {
          <a class="btn" routerLink="/login">Sign in</a>
        }
      </div>
    </header>

    <main id="main-content" tabindex="-1" #main [attr.aria-busy]="ui.loading()">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <p>Demo application: dummy data, route guards, HTTP interceptor and role-based access.</p>
    </footer>

    @if (ui.loading()) {
      <div class="loader" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>Loading…</span>
      </div>
    }

    <!-- Polite live region for route changes, errors and action results -->
    <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {{ ui.announcement() }}
    </div>
  `,
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  protected readonly ui = inject(UiService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private firstNavigation = true;

  protected readonly visibleMenu = computed(() => MENU.filter((item) => this.auth.canAccess(item)));

  constructor() {
    // After each navigation: announce the new page title and move focus to the main region.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.firstNavigation) {
          this.firstNavigation = false;
          return;
        }
        // Wait a tick so the Title strategy has updated document.title.
        setTimeout(() => {
          this.ui.announce(`Navigated to ${this.title.getTitle().split('|')[0].trim()}`);
          this.main().nativeElement.focus();
        });
      });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/home').then(() => this.ui.announce('You have been signed out.'));
  }
}
