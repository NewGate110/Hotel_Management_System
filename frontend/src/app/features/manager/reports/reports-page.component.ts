// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { ReportsApiService } from '../../../core/services/reports-api.service';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { HotelSummaryDto } from '../../../core/models/hotel.models';
import type { BookingDto } from '../../../core/models/booking.models';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { AppChartCardComponent } from '../../../shared/ui/app-chart-card/app-chart-card.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { toYmd } from '../../../shared/utils/date.utils';
import type { ChartConfiguration } from 'chart.js';

// Azure Shores palette — resolved since Chart.js cannot read CSS variables
const STATUS_COLOURS: Record<string, string> = {
  Confirmed:  '#2E5768',  // azure-500
  CheckedIn:  '#5E8A7A',  // glass-500
  CheckedOut: '#8C7B5F',  // sand-500
  Cancelled:  '#A8412E',  // danger
  Pending:    '#C87551',  // clay-400
  NoShow:     '#4A3F30',  // sand-700
};

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    AppStatCardComponent,
    AppChartCardComponent,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--bg-alt) 25%, var(--bg-sunk) 50%, var(--bg-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: var(--r-xl);
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow mb-1">Hotel Manager</p>
          <h2 style="color: var(--fg)">Reports</h2>
        </div>
        @if (hotels().length > 1) {
          <mat-form-field appearance="outline" style="width: 220px">
            <mat-label>Hotel</mat-label>
            <mat-select [value]="selectedHotelId()" (valueChange)="selectHotel($event)">
              @for (h of hotels(); track h.id) {
                <mat-option [value]="h.id">{{ h.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <!-- Date range filter -->
      <form [formGroup]="range" class="flex flex-wrap items-center gap-3">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>From</mat-label>
          <input matInput [matDatepicker]="f" formControlName="from" />
          <mat-datepicker-toggle matIconSuffix [for]="f" />
          <mat-datepicker #f />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>To</mat-label>
          <input matInput [matDatepicker]="t" formControlName="to" />
          <mat-datepicker-toggle matIconSuffix [for]="t" />
          <mat-datepicker #t />
        </mat-form-field>
        <app-button variant="primary" type="button" (clicked)="load()">Refresh</app-button>
      </form>

      <!-- Summary KPIs -->
      <div class="grid items-stretch gap-4 sm:grid-cols-3">
        <app-stat-card label="Total revenue"     [value]="totalRevenue()"     hint="Selected window" />
        <app-stat-card label="Total bookings"    [value]="totalBookings()"    hint="Confirmed + checked-in/out" />
        <app-stat-card label="Avg. booking value"[value]="avgBookingValue()"  hint="Revenue ÷ bookings" />
      </div>

      <!-- Charts -->
      @if (loading()) {
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="skeleton" style="height: 320px"></div>
          <div class="skeleton" style="height: 320px"></div>
        </div>
        <div class="skeleton" style="height: 320px"></div>
      } @else {
        <div class="grid gap-4 lg:grid-cols-2">
          <app-chart-card title="Weekly revenue" [type]="'bar'"  [data]="revenueChart()"   [options]="barOptions" />
          <app-chart-card title="Occupancy trend" [type]="'line'" [data]="occupancyChart()" [options]="lineOptions" />
        </div>
        <app-chart-card title="Booking status breakdown" [type]="'doughnut'" [data]="statusChart()" [options]="doughnutOptions" />
      }

    </div>
  `,
})
export class ReportsPageComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly reportsApi  = inject(ReportsApiService);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly hotelsApi   = inject(HotelsApiService);
  private readonly notify      = inject(NotificationService);

  readonly hotels          = signal<HotelSummaryDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly loading         = signal(true);

  readonly totalRevenue     = signal('—');
  readonly totalBookings    = signal('—');
  readonly avgBookingValue  = signal('—');

  readonly revenueChart   = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly occupancyChart = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly statusChart    = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });

  readonly range = this.fb.nonNullable.group({
    from: [new Date(Date.now() - 86_400_000 * 90)],
    to:   [new Date()],
  });

  readonly barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v) => `$${Number(v).toLocaleString()}` } } },
  };

  readonly lineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } },
  };

  readonly doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
    },
  };

  constructor() {
    this.hotelsApi.getAll().subscribe({
      next: (list) => {
        this.hotels.set(list);
        if (list.length) {
          this.selectedHotelId.set(list[0]!.id);
          this.load();
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load hotels.'); },
    });
  }

  selectHotel(id: number): void {
    this.selectedHotelId.set(id);
    this.load();
  }

  load(): void {
    const hid = this.selectedHotelId();
    if (!hid) return;
    this.loading.set(true);

    const v    = this.range.getRawValue();
    const from = toYmd(v.from);
    const to   = toYmd(v.to);

    forkJoin({
      occ:      this.reportsApi.getOccupancy(hid, from, to),
      rev:      this.reportsApi.getRevenue(hid, from, to),
      bookings: this.bookingsApi.getByHotel(hid),
    }).subscribe({
      next: ({ occ, rev, bookings }) => {
        const fromDate = new Date(from);
        const toDate   = new Date(to);

        // Summary KPIs
        this.totalRevenue.set(`$${Number(rev.totalRevenue).toLocaleString('en-US', { maximumFractionDigits: 0 })}`);
        this.totalBookings.set(String(rev.totalBookings));
        this.avgBookingValue.set(rev.totalBookings > 0
          ? `$${Number(rev.averageBookingValue).toFixed(0)}`
          : '$0');

        // Charts
        this.revenueChart.set(this.buildWeeklyRevenue(bookings, fromDate, toDate));
        this.occupancyChart.set(this.buildWeeklyOccupancy(bookings, fromDate, toDate, occ.totalRooms));
        this.statusChart.set(this.buildStatusBreakdown(bookings, fromDate, toDate));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load report data.');
      },
    });
  }

  // ── Chart builders ──────────────────────────────────────────────────────────

  private buildWeeklyRevenue(
    bookings: BookingDto[], from: Date, to: Date,
  ): ChartConfiguration['data'] {
    const buckets = this.weekBuckets(from, to);
    const totals  = new Map(buckets.map(b => [b.key, 0]));

    for (const b of bookings) {
      if (b.status === 'Cancelled') continue;
      const d = new Date(b.checkInDate);
      if (d < from || d > to) continue;
      const key = this.weekKey(d);
      if (totals.has(key)) totals.set(key, totals.get(key)! + Number(b.totalAmount));
    }

    return {
      labels: buckets.map(b => b.label),
      datasets: [{
        label: 'Revenue ($)',
        data: buckets.map(b => totals.get(b.key) ?? 0),
        backgroundColor: '#2E5768',
        borderRadius: 4,
      }],
    };
  }

  private buildWeeklyOccupancy(
    bookings: BookingDto[], from: Date, to: Date, totalRooms: number,
  ): ChartConfiguration['data'] {
    const buckets  = this.weekBuckets(from, to);
    const occupied = new Map(buckets.map(b => [b.key, new Set<number>()]));

    for (const b of bookings) {
      if (b.status === 'Cancelled') continue;
      const d = new Date(b.checkInDate);
      if (d < from || d > to) continue;
      const key = this.weekKey(d);
      if (occupied.has(key)) b.rooms.forEach(r => occupied.get(key)!.add(r.id));
    }

    const denom = totalRooms || 1;
    return {
      labels: buckets.map(b => b.label),
      datasets: [{
        label: 'Occupancy %',
        data: buckets.map(b => Math.round((occupied.get(b.key)!.size / denom) * 1000) / 10),
        borderColor: '#5E8A7A',
        backgroundColor: 'rgba(94,138,122,0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      }],
    };
  }

  private buildStatusBreakdown(
    bookings: BookingDto[], from: Date, to: Date,
  ): ChartConfiguration['data'] {
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      const d = new Date(b.checkInDate);
      if (d < from || d > to) continue;
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    const labels = Object.keys(counts).sort();
    return {
      labels,
      datasets: [{
        data: labels.map(l => counts[l]!),
        backgroundColor: labels.map(l => STATUS_COLOURS[l] ?? '#D4C8B3'),
        borderWidth: 0,
      }],
    };
  }

  private weekBuckets(from: Date, to: Date): Array<{ key: string; label: string }> {
    const result: Array<{ key: string; label: string }> = [];
    const cur = new Date(from);
    cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));
    while (cur <= to) {
      result.push({
        key:   cur.toISOString().slice(0, 10),
        label: cur.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      });
      cur.setDate(cur.getDate() + 7);
    }
    return result;
  }

  private weekKey(d: Date): string {
    const s = new Date(d);
    s.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return s.toISOString().slice(0, 10);
  }
}
