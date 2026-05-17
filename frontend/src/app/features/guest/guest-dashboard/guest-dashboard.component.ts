import { SlicePipe } from '@angular/common';
import { FormatTypePipe } from '../../../shared/pipes/format-type.pipe';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import type { BookingDto } from '../../../core/models/booking.models';
import type { GuestStatsDto } from '../../../core/models/user.models';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppTableComponent } from '../../../shared/ui/app-table/app-table.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [
    SlicePipe,
    RouterLink,
    MatTableModule,
    AppStatCardComponent,
    AppLoaderComponent,
    AppEmptyStateComponent,
    AppTableComponent,
    AppButtonComponent,
    AppBadgeComponent,
    FormatTypePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px;">

      <!-- Welcome header -->
      <div style="display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 24px; border-bottom: 1px solid var(--border);">
        <div>
          <p class="eyebrow">Good day</p>
          <h1 style="font-family: var(--font-display); font-size: clamp(32px,4vw,48px); font-weight: 300; letter-spacing: -0.03em; color: var(--fg); margin: 10px 0 0;">
            Welcome back, {{ firstName() }}.
          </h1>
        </div>
        @if (stats()?.tier) {
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--r-pill); background: var(--sand-900); flex-shrink: 0;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--clay-200); flex-shrink: 0;"></span>
            <span style="font-size: 11px; letter-spacing: var(--ls-widest); text-transform: uppercase; color: var(--clay-100);">{{ stats()!.tier }} member</span>
          </div>
        }
      </div>

      <!-- KPI grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;" class="guest-kpi-grid">
        <app-stat-card label="Upcoming stays" [value]="upcoming().toString()" hint="Confirmed forward" />
        <app-stat-card label="Total spend" [value]="stats() ? '$' + stats()!.totalSpend.toFixed(0) : '—'" hint="All completed stays" />
        <app-stat-card label="Past stays" [value]="past().toString()" hint="Checked out" />
        <app-stat-card label="Programme tier" [value]="stats()?.tier ?? '—'" [hint]="tierHint()" />
      </div>

      <!-- Quick actions -->
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <a routerLink="/app/guest/booking" style="text-decoration: none;">
          <app-button variant="primary" type="button">
            <span class="material-icons-outlined" style="font-size: 16px;">add</span>
            New booking
          </app-button>
        </a>
        <a routerLink="/app/guest/profile" style="text-decoration: none;">
          <app-button variant="secondary" type="button">
            <span class="material-icons-outlined" style="font-size: 16px;">person</span>
            Profile
          </app-button>
        </a>
      </div>

      <!-- Bookings table -->
      <div class="card-surface" style="overflow: hidden;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border);">
          <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 400; letter-spacing: -0.01em; color: var(--fg); margin: 0;">Bookings</h2>
          <a routerLink="/app/guest/booking" style="font-size: var(--fs-xs); color: var(--fg-2); text-decoration: none;">New booking →</a>
        </div>

        @if (loading()) {
          <app-loader caption="Loading bookings…" />
        } @else if (!bookings().length) {
          <app-empty-state
            icon="event"
            title="No bookings yet"
            actionLabel="Start a booking"
            (action)="navBook()"
          />
        } @else {
          <app-table>
            <table mat-table [dataSource]="bookings()" class="w-full">
              <ng-container matColumnDef="hotel">
                <th mat-header-cell *matHeaderCellDef>Hotel</th>
                <td mat-cell *matCellDef="let b">{{ b.hotelName }}</td>
              </ng-container>
              <ng-container matColumnDef="room">
                <th mat-header-cell *matHeaderCellDef>Room</th>
                <td mat-cell *matCellDef="let b">
                  @if (b.rooms.length > 0) {
                    <span style="font-family: var(--font-mono); font-size: 12px;">{{ b.rooms[0].roomNumber }}</span>
                    · {{ b.rooms[0].type | formatType }}
                  } @else { — }
                </td>
              </ng-container>
              <ng-container matColumnDef="guests">
                <th mat-header-cell *matHeaderCellDef>Guests</th>
                <td mat-cell *matCellDef="let b">{{ b.guestCount }}</td>
              </ng-container>
              <ng-container matColumnDef="dates">
                <th mat-header-cell *matHeaderCellDef>Dates</th>
                <td mat-cell *matCellDef="let b" style="font-size: 13px; color: var(--fg-2);">
                  {{ b.checkInDate | slice: 0 : 10 }} → {{ b.checkOutDate | slice: 0 : 10 }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let b">
                  <app-badge [tone]="statusTone(b.status)" [dot]="true">{{ b.status }}</app-badge>
                </td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let b">
                  <span class="price" style="font-size: 14px;">&#36;{{ b.totalAmount }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
          </app-table>
        }
      </div>
    </div>

    <style>
      @media (max-width: 1024px) { .guest-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      @media (max-width: 480px)  { .guest-kpi-grid { grid-template-columns: 1fr !important; } }
    </style>
  `,
})
export class GuestDashboardComponent {
  readonly auth = inject(AuthService);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly usersApi    = inject(UsersApiService);
  private readonly router      = inject(Router);

  readonly cols = ['hotel', 'room', 'guests', 'dates', 'status', 'total'];
  readonly bookings = signal<BookingDto[]>([]);
  readonly stats    = signal<GuestStatsDto | null>(null);
  readonly loading  = signal(true);

  readonly firstName = computed(() => {
    const full = this.auth.fullName();
    return full ? full.split(' ')[0] : 'there';
  });

  readonly upcoming = computed(() =>
    this.bookings().filter((b) => b.status === 'Confirmed' || b.status === 'CheckedIn').length,
  );
  readonly past = computed(() => this.bookings().filter((b) => b.status === 'CheckedOut').length);

  constructor() {
    const uid = this.auth.userId();
    if (uid == null) { this.loading.set(false); return; }
    this.bookingsApi.getByGuest(uid).subscribe({
      next: (rows) => { this.bookings.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.usersApi.getGuestStats(uid).subscribe({ next: (s) => this.stats.set(s) });
  }

  statusTone(status: string): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
    switch (status) {
      case 'Confirmed':  return 'info';
      case 'CheckedIn':  return 'success';
      case 'CheckedOut': return 'neutral';
      case 'Cancelled':  return 'danger';
      default:           return 'neutral';
    }
  }

  tierHint(): string {
    const t = this.stats()?.tier;
    if (t === 'Bronze') return 'Bronze: 0–2 stays';
    if (t === 'Silver') return 'Silver: 3–9 stays';
    if (t === 'Gold')   return 'Gold: 10+ stays';
    return 'Grand Rewards';
  }

  navBook(): void { void this.router.navigate(['/app/guest/booking']); }
}
