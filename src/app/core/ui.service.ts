import { Injectable, computed, signal } from '@angular/core';

/** Holds the global loading state and screen-reader announcements. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly pending = signal(0);
  readonly loading = computed(() => this.pending() > 0);
  readonly announcement = signal('');

  startLoading(): void {
    this.pending.update((n) => n + 1);
  }

  stopLoading(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  /** Text is placed in an aria-live region. Toggling forces repeated messages to be re-read. */
  announce(message: string): void {
    this.announcement.set('');
    setTimeout(() => this.announcement.set(message), 50);
  }
}
