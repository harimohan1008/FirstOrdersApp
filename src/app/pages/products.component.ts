import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DummyDataService } from '../core/dummy-data.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Products</h1>

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
            </tr>
          } @empty {
            <tr><td colspan="4">No products match your filters.</td></tr>
          }
        </tbody>
      </table>
    } @else {
      <p>Loading products…</p>
    }
  `,
})
export class ProductsComponent {
  protected readonly products = toSignal(inject(DummyDataService).getProducts());
  protected readonly search = signal('');
  protected readonly category = signal('');

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
}
