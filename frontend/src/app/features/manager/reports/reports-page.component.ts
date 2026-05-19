// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportsApiService } from '../../../core/services/reports-api.service';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { environment } from '../../../../environments/environment';
import { AppChartCardComponent } from '../../../shared/ui/app-chart-card/app-chart-card.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import type { ChartConfiguration } from 'chart.js';

const STATUS_COLOURS: Record<string, string> = {
  Confirmed:  '#3b82f6',
  CheckedIn:  '#22c55e',
  CheckedOut: '#a3a3a3',
  Cancelled:  '#ef4444',
  Pending:    '#f59e0b',
  NoShow:     '#8b5cf6',
};

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    AppChartCardComponent,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-zinc-900">Reports</h1>
      <form [formGroup]="range" class="flex flex-wrap items-end gap-3">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input matInput [matDatepicker]="f" formControlName="from" />
          <mat-datepicker-toggle matIconSuffix [for]="f" />
          <mat-datepicker #f />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>To</mat-label>
          <input matInput [matDatepicker]="t" formControlName="to" />
          <mat-datepicker-toggle matIconSuffix [for]="t" />
          <mat-datepicker #t />
        </mat-form-field>
        <app-button variant="primary" type="button" (clicked)="load()">Refresh</app-button>
      </form>
      <div class="grid gap-4 lg:grid-cols-2">
        <app-chart-card title="Revenue" [type]="'bar'" [data]="revenueChart()" />
        <app-chart-card title="Occupancy %" [type]="'line'" [data]="occupancyChart()" />
      </div>
      <app-chart-card title="Booking status breakdown" [type]="'doughnut'" [data]="statusChart()" />
    </div>
  `,
})
export class ReportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly bookingsApi = inject(BookingsApiService);

  readonly range = this.fb.nonNullable.group({
    from: [new Date(Date.now() - 86400000 * 90)],
    to: [new Date()],
  });

  readonly revenueChart = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly occupancyChart = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly statusChart = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });

  constructor() {
    this.load();
  }

  load(): void {
    const v = this.range.getRawValue();
    const from = v.from.toISOString().slice(0, 10);
    const to = v.to.toISOString().slice(0, 10);
    const hid = environment.defaultHotelId;

    this.reportsApi.getRevenue(hid, from, to).subscribe((r) => {
      this.revenueChart.set({
        labels: ['Period total'],
        datasets: [{ label: '$', data: [Number(r.totalRevenue)] }],
      });
    });

    this.reportsApi.getOccupancy(hid, from, to).subscribe((o) => {
      this.occupancyChart.set({
        labels: ['Occupancy'],
        datasets: [{ label: '%', data: [o.occupancyRate], tension: 0.3 }],
      });
    });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    this.bookingsApi.getByHotel(hid).subscribe((bookings) => {
      const inRange = bookings.filter((b) => {
        const d = new Date(b.checkInDate);
        return d >= fromDate && d <= toDate;
      });
      const counts: Record<string, number> = {};
      for (const b of inRange) {
        counts[b.status] = (counts[b.status] ?? 0) + 1;
      }
      const labels = Object.keys(counts);
      this.statusChart.set({
        labels,
        datasets: [{
          data: labels.map((l) => counts[l]),
          backgroundColor: labels.map((l) => STATUS_COLOURS[l] ?? '#d4d4d4'),
        }],
      });
    });
  }
}
