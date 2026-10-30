import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { DummyDataService } from '../core/dummy-data.service';
import { Product } from '../core/models';
import { UiService } from '../core/ui.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  styles: [
    `
      .toolbar { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; justify-content: space-between; }
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
    <h1>Products</h1>

    <div class="toolbar">
      <form class="filters" role="search" aria-label="Filter products" (submit)="$event.preventDefault()">
        <div class="field">
          <label for="search">Search by name</label>
          <input id="search" type="search" [ngModel]="search()" (ngModelChange)="search.set($event)" name="search" />
        </div>
        <div class="field">
          <label for="category">Category</label>
          <select id="category" [ngModel]="category()" (ngModelChange)="category.set($event)" name="category">
            <option value="">All categories</option>
            @for (c of categories(); track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>
      </form>

      @if (canEdit()) {
        <button type="button" id="add-product" class="btn primary" (click)="openAdd()">Add product</button>
      }
    </div>

    @if (mode(); as m) {
      <section class="panel" aria-labelledby="form-heading">
        <h2 id="form-heading" tabindex="-1">{{ m === 'add' ? 'Add product' : 'Edit product' }}</h2>

        @if (formError()) {
          <p id="form-error" class="error" role="alert">{{ formError() }}</p>
        }

        <form (ngSubmit)="save()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="p-name">Name</label>
              <input id="p-name" name="name" type="text" required [(ngModel)]="form.name"
                [attr.aria-invalid]="formError() ? 'true' : null"
                [attr.aria-describedby]="formError() ? 'form-error' : null" />
            </div>
            <div class="field">
              <label for="p-category">Category</label>
              <input id="p-category" name="category" type="text" required [(ngModel)]="form.category" />
            </div>
            <div class="field">
              <label for="p-price">Price</label>
              <input id="p-price" name="price" type="number" min="0" step="0.01" required [(ngModel)]="form.price" />
            </div>
            <div class="field">
              <label for="p-stock">Stock</label>
              <input id="p-stock" name="stock" type="number" min="0" step="1" required [(ngModel)]="form.stock" />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </form>
      </section>
    }

    @if (products()) {
      <p class="result-count" role="status">{{ filtered().length }} of {{ products()!.length }} products shown</p>
      <table>
        <caption class="visually-hidden">Product list</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col" class="num">Price</th>
            <th scope="col">Availability</th>
            @if (canEdit()) {
              <th scope="col">Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (p of filtered(); track p.id) {
            <tr>
              <th scope="row">{{ p.name }}</th>
              <td>{{ p.category }}</td>
              <td class="num">{{ p.price | currency }}</td>
              <td>
                @if (p.stock > 0) {
                  <span class="status status-delivered">In stock ({{ p.stock }})</span>
                } @else {
                  <span class="status status-cancelled">Out of stock</span>
                }
              </td>
              @if (canEdit()) {
                <td>
                  <div class="row-actions">
                    <button type="button" class="btn small" (click)="openEdit(p)" [attr.aria-label]="'Edit ' + p.name">Edit</button>
                    @if (canDelete()) {
                      <button type="button" class="btn small danger" (click)="remove(p)" [attr.aria-label]="'Delete ' + p.name">Delete</button>
                    }
                  </div>
                </td>
              }
            </tr>
          } @empty {
            <tr><td [attr.colspan]="canEdit() ? 5 : 4">No products match your filters.</td></tr>
          }
        </tbody>
      </table>
    } @else {
      <p>Loading products…</p>
    }
  `,
})
export class ProductsComponent {
  private readonly data = inject(DummyDataService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);

  protected readonly products = signal<Product[] | null>(null);
  protected readonly search = signal('');
  protected readonly category = signal('');

  protected readonly mode = signal<'add' | 'edit' | null>(null);
  protected readonly formError = signal('');
  protected readonly saving = signal(false);
  protected form = { name: '', category: '', price: 0, stock: 0 };
  private editingId: number | null = null;

  /** Managers and admins can add/edit; only admins can delete (the API enforces the same rules). */
  protected readonly canEdit = computed(() => this.auth.hasRole(['admin', 'manager']));
  protected readonly canDelete = computed(() => this.auth.hasRole(['admin']));

  protected readonly categories = computed(() =>
    [...new Set((this.products() ?? []).map((p) => p.category))].sort(),
  );

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const cat = this.category();
    return (this.products() ?? []).filter(
      (p) => (!cat || p.category === cat) && (!term || p.name.toLowerCase().includes(term)),
    );
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.data.getProducts().subscribe((list) => this.products.set(list));
  }

  protected openAdd(): void {
    this.editingId = null;
    this.form = { name: '', category: '', price: 0, stock: 0 };
    this.openForm('add');
  }

  protected openEdit(p: Product): void {
    this.editingId = p.id;
    this.form = { name: p.name, category: p.category, price: p.price, stock: p.stock };
    this.openForm('edit');
  }

  private openForm(mode: 'add' | 'edit'): void {
    this.formError.set('');
    this.mode.set(mode);
    // Move focus to the form heading so keyboard and screen-reader users land in it.
    setTimeout(() => document.getElementById('form-heading')?.focus());
  }

  protected cancel(): void {
    this.closeForm();
  }

  private closeForm(): void {
    this.mode.set(null);
    this.formError.set('');
    setTimeout(() => document.getElementById('add-product')?.focus());
  }

  protected save(): void {
    if (this.saving()) {
      return;
    }
    const { name, category, price, stock } = this.form;
    if (!name.trim() || !category.trim()) {
      this.formError.set('Name and category are required.');
      return;
    }
    if (price < 0 || stock < 0) {
      this.formError.set('Price and stock cannot be negative.');
      return;
    }

    const body = { name: name.trim(), category: category.trim(), price: Number(price), stock: Number(stock) };
    const request =
      this.editingId === null ? this.data.createProduct(body) : this.data.updateProduct(this.editingId, body);

    this.saving.set(true);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.announce(`${saved.name} ${this.editingId === null ? 'added' : 'updated'}.`);
        this.closeForm();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err?.error?.message ?? 'The product could not be saved. Please try again.');
      },
    });
  }

  protected remove(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      return;
    }
    this.data.deleteProduct(p.id).subscribe({
      next: () => {
        this.ui.announce(`${p.name} deleted.`);
        this.load();
        setTimeout(() => document.getElementById('search')?.focus());
      },
    });
  }
}
