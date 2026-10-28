import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DummyDataService } from '../core/dummy-data.service';
import { ALL_ROLES, Role, User } from '../core/models';
import { UiService } from '../core/ui.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Admin</h1>
    <p>Manage user roles. Changes are kept in memory only (dummy service).</p>

    @if (users(); as list) {
      <table>
        <caption>Users and roles</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Username</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          @for (u of list; track u.id) {
            <tr>
              <th scope="row">{{ u.displayName }}</th>
              <td>{{ u.username }}</td>
              <td>
                <label [for]="'role-' + u.id" class="visually-hidden">Role for {{ u.displayName }}</label>
                <select [id]="'role-' + u.id" [ngModel]="u.role" (ngModelChange)="changeRole(u, $event)">
                  @for (r of roles; track r) {
                    <option [value]="r">{{ r }}</option>
                  }
                </select>
              </td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <p>Loading users…</p>
    }
  `,
})
export class AdminComponent {
  private readonly data = inject(DummyDataService);
  private readonly ui = inject(UiService);

  protected readonly roles = ALL_ROLES;
  protected readonly users = signal<User[] | null>(null);

  constructor() {
    this.data.getUsers().subscribe((u) => this.users.set(u));
  }

  protected changeRole(user: User, role: Role): void {
    this.data.updateUserRole(user.id, role).subscribe((updated) => {
      this.users.update((list) => (list ?? []).map((u) => (u.id === user.id && updated ? updated : u)));
      this.ui.announce(`${user.displayName} is now ${role}.`);
    });
  }
}
