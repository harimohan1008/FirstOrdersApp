import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { DummyDataService } from '../core/dummy-data.service';
import { Order } from '../core/models';
import { UiService } from '../core/ui.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  styles: [
    `
      .toolbar { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
      .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem 1.25rem; margin: 1rem 0; }
      .panel h2 { margin-top: 0; }
      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0 1rem; }
      .form-actions, .row-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .btn.danger { border-color: var(--danger); color: var(--danger); }
      .btn.danger:hover { background: #fde8e8; }
      .btn.small { padding: 0.25rem 0.75rem; min-height: 44px; }
    `,
  ],
  template: `
    <h1>Orders</h1>

    <div class="toolbar">
      <button type="button" id="add-order" class="btn primary" (click)="openAdd()">Add order</button>
    </div>

    @if (mode(); as m) {
      <section class="panel" aria-labelledby="order-form-heading">
        <h2 id="order-form-heading" tabindex="-1">{{ m === 'add' ? 'Add order' : 'Edit order' }}</h2>

        @if (formError()) {
          <p id="order-form-error" class="error" role="alert">{{ formError() }}</p>
        }

        <form (ngSubmit)="save()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="o-customer">Customer</label>
              <input id="o-customer" name="customer" type="text" required [(ngModel)]="form.customer"
                [attr.aria-invalid]="formError() ? 'true' : null"
                [attr.aria-describedby]="formError() ? 'order-form-error' : null" />
            </div>
            <div class="field">
              <label for="o-date">Date</label>
              <input id="o-date" name="date" type="date" required [(ngModel)]="form.date" />
            </div>
            <div class="field">
              <label for="o-total">Total</label>
              <input id="o-total" name="total" type="number" min="0" step="0.01" required [(ngModel)]="form.total" />
            </div>
            <div class="field">
              <label for="o-status">Status</label>
              <select id="o-status" name="status" [(ngModel)]="form.status">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
            <button type="button" class="btn" (click)="closeForm()">Cancel</button>
          </div>
        </form>
      </section>
    }

    @if (orders(); as list) {
      <table>
        <caption>
          Recent orders ({{ list.length }} total)
        </caption>
        <thead>
          <tr>
            <th scope="col">Order #</th>
            <th scope="col">Customer</th>
            <th scope="col">Date</th>
            <th scope="col" class="num">Total</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (o of list; track o.id) {
            <tr>
              <th scope="row">{{ o.id }}</th>
              <td>{{ o.customer }}</td>
              <td><time [attr.datetime]="o.date">{{ o.date | date: 'mediumDate' }}</time></td>
              <td class="num">{{ o.total | currency }}</td>
              <td>
                <span class="status" [class]="'status-' + o.status.toLowerCase()">{{ o.status }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn small" (click)="openEdit(o)" [attr.aria-label]="'Edit order ' + o.id">Edit</button>
                  @if (canDelete()) {
                    <button type="button" class="btn small danger" (click)="remove(o)" [attr.aria-label]="'Delete order ' + o.id">Delete</button>
                  }
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6">No orders yet.</td></tr>
          }
        </tbody>
      </table>
    } @else {
      <p>Loading orders…</p>
    }
  `,
})
export class OrdersComponent {
  private readonly data = inject(DummyDataService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);

  protected readonly statuses: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  protected readonly orders = signal<Order[] | null>(null);

  protected readonly mode = signal<'add' | 'edit' | null>(null);
  protected readonly formError = signal('');
  protected readonly saving = signal(false);
  protected form = this.blank();
  private editingId: number | null = null;

  /** Only admins can delete (the API enforces the same rule). */
  protected readonly canDelete = computed(() => this.auth.hasRole(['admin']));

  constructor() {
    this.load();
  }

  private blank() {
    return { customer: '', date: new Date().toISOString().slice(0, 10), total: 0, status: 'Processing' as Order['status'] };
  }

  private load(): void {
    this.data.getOrders().subscribe((list) => this.orders.set(list));
  }

  protected openAdd(): void {
    this.editingId = null;
    this.form = this.blank();
    this.openForm('add');
  }

  protected openEdit(o: Order): void {
    this.editingId = o.id;
    this.form = { customer: o.customer, date: o.date, total: o.total, status: o.status };
    this.openForm('edit');
  }

  private openForm(mode: 'add' | 'edit'): void {
    this.formError.set('');
    this.mode.set(mode);
    setTimeout(() => document.getElementById('order-form-heading')?.focus());
  }

  protected closeForm(): void {
    this.mode.set(null);
    this.formError.set('');
    setTimeout(() => document.getElementById('add-order')?.focus());
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }
    const { customer, date, total, status } = this.form;
    if (!customer.trim()) {
      this.formError.set('Customer is required.');
      return;
    }
    if (!date) {
      this.formError.set('Date is required.');
      return;
    }
    if (total < 0) {
      this.formError.set('Total cannot be negative.');
      return;
    }

    const body = { customer: customer.trim(), date, total: Number(total), status };
    const adding = this.editingId === null;
    const request = adding ? this.data.createOrder(body) : this.data.updateOrder(this.editingId!, body);

    this.saving.set(true);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.announce(`Order ${saved.id} ${adding ? 'added' : 'updated'}.`);
        this.closeForm();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err?.error?.message ?? 'The order could not be saved. Please try again.');
      },
    });
  }

  protected remove(o: Order): void {
    if (!confirm(`Delete order ${o.id} for ${o.customer}? This cannot be undone.`)) {
      return;
    }
    this.data.deleteOrder(o.id).subscribe({
      next: () => {
        this.ui.announce(`Order ${o.id} deleted.`);
        this.load();
        setTimeout(() => document.getElementById('add-order')?.focus());
      },
    });
  }
}
