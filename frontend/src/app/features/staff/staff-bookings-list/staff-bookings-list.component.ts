// Author: S2401265 Ahmed Aslan Ibrahim
import { SlicePipe } from '@angular/common';
import { FormatTypePipe } from '../../../shared/pipes/format-type.pipe';
import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { BookingDto } from '../../../core/models/booking.models';
import type { HotelSummaryDto } from '../../../core/models/hotel.models';
import { AppTableComponent } from '../../../shared/ui/app-table/app-table.component';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { AppCardComponent } from '../../../shared/ui/app-card/app-card.component';

@Component({
  selector: 'app-staff-bookings-list',
  standalone: true,
  imports: [
    SlicePipe,
    FormatTypePipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    AppTableComponent,
    AppLoaderComponent,
    AppButtonComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div>
        <p class="eyebrow mb-1">Front Desk</p>
        <h2 style="color: var(--fg)">Hotel bookings</h2>
      </div>

      <!-- Controls row -->
      <div class="flex flex-wrap items-center gap-3">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width: 240px;">
          <mat-label>Hotel</mat-label>
          <mat-select [value]="selectedHotelId()" (valueChange)="selectHotel($event)">
            @for (h of hotels(); track h.id) {
              <mat-option [value]="h.id">{{ h.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width: 160px;">
          <mat-label>Status</mat-label>
          <mat-select [value]="statusFilter()" (valueChange)="statusFilter.set($event)">
            @for (s of statusOptions; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <app-button variant="secondary" (clicked)="toggleSort()">
          Check-in {{ sortDir() === 'asc' ? '↑' : '↓' }}
        </app-button>
      </div>

      <!-- Summary line -->
      @if (!loading() && selectedHotelId()) {
        <p style="font-size: var(--fs-sm); color: var(--fg-3);">
          Showing {{ rows().length }} booking{{ rows().length === 1 ? '' : 's' }}
          @if (statusFilter() !== 'All') { <span>· filtered to <strong>{{ statusFilter() }}</strong></span> }
        </p>
      }

      <!-- Table -->
      <app-card>
        @if (!selectedHotelId()) {
          <p style="padding: 32px; text-align: center; font-size: var(--fs-sm); color: var(--fg-3);">
            Select a hotel above to load bookings.
          </p>
        } @else if (loading()) {
          <app-loader caption="Loading bookings…" />
        } @else if (rows().length === 0) {
          <p style="padding: 32px; text-align: center; font-size: var(--fs-sm); color: var(--fg-3);">
            No bookings match the current filter.
          </p>
        } @else {
          <app-table>
            <table mat-table [dataSource]="rows()" class="w-full">

              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef style="width: 72px;">#ID</th>
                <td mat-cell *matCellDef="let b">
                  <span style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-3);">#{{ b.id }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="guest">
                <th mat-header-cell *matHeaderCellDef>Guest</th>
                <td mat-cell *matCellDef="let b">{{ b.guestName }}</td>
              </ng-container>

              <ng-container matColumnDef="room">
                <th mat-header-cell *matHeaderCellDef>Room</th>
                <td mat-cell *matCellDef="let b">
                  @if (b.rooms.length > 0) {
                    <span>{{ b.rooms[0].roomNumber }}</span>
                    <span style="font-size: 11px; color: var(--fg-3);"> · {{ b.rooms[0].type | formatType }}</span>
                  } @else {
                    <span style="color: var(--fg-3);">—</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="checkin">
                <th mat-header-cell *matHeaderCellDef>Check-in</th>
                <td mat-cell *matCellDef="let b">{{ b.checkInDate | slice:0:10 }}</td>
              </ng-container>

              <ng-container matColumnDef="checkout">
                <th mat-header-cell *matHeaderCellDef>Check-out</th>
                <td mat-cell *matCellDef="let b">{{ b.checkOutDate | slice:0:10 }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let b">
                  <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        [class]="statusClass(b.status)">{{ b.status }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;">Total</th>
                <td mat-cell *matCellDef="let b" style="text-align: right;">
                  <span style="font-weight: 600;">&#36;{{ b.totalAmount }}</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
          </app-table>
        }
      </app-card>

    </div>
  `,
})
export class StaffBookingsListComponent {
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly hotelsApi   = inject(HotelsApiService);
  private readonly notify      = inject(NotificationService);

  readonly cols = ['id', 'guest', 'room', 'checkin', 'checkout', 'status', 'total'];
  readonly statusOptions = ['All', 'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];

  readonly hotels          = signal<HotelSummaryDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly allRows         = signal<BookingDto[]>([]);
  readonly loading         = signal(false);
  readonly statusFilter    = signal('All');
  readonly sortDir         = signal<'asc' | 'desc'>('asc');

  readonly rows = computed(() => {
    let list = this.allRows();
    if (this.statusFilter() !== 'All') list = list.filter(b => b.status === this.statusFilter());
    return list.slice().sort((a, b) => {
      const diff = new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      return this.sortDir() === 'asc' ? diff : -diff;
    });
  });

  constructor() {
    this.hotelsApi.getAll().subscribe({
      next: (list) => {
        this.hotels.set(list);
        if (list.length) this.selectHotel(list[0]!.id);
      },
      error: () => this.notify.error('Failed to load hotels.'),
    });
  }

  selectHotel(id: number): void {
    this.selectedHotelId.set(id);
    this.loading.set(true);
    this.allRows.set([]);
    this.bookingsApi.getByHotel(id).subscribe({
      next:  (b) => { this.allRows.set(b); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load bookings.'); },
    });
  }

  toggleSort(): void {
    this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Confirmed:  'bg-[var(--glass-50)] text-[var(--glass-600)]',
      Pending:    'bg-[var(--clay-50)] text-[var(--clay-600)]',
      CheckedIn:  'bg-[var(--azure-50)] text-[var(--azure-700)]',
      CheckedOut: 'bg-[var(--sand-100)] text-[var(--fg-2)]',
      Cancelled:  'bg-red-50 text-red-600',
    };
    return map[status] ?? 'bg-[var(--sand-100)] text-[var(--fg-2)]';
  }
}
