import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DummyDataService } from '../core/dummy-data.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h1>Orders</h1>
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
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <p>Loading orders…</p>
    }
  `,
})
export class OrdersComponent {
  protected readonly orders = toSignal(inject(DummyDataService).getOrders());
}
