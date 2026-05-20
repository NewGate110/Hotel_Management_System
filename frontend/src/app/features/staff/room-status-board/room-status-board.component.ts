// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormatTypePipe } from '../../../shared/pipes/format-type.pipe';
import type { RoomDto } from '../../../core/models/room.models';
import type { HotelSummaryDto } from '../../../core/models/hotel.models';
import { ROOM_STATUSES, type RoomStatus } from '../../../core/constants/room-status';

interface StatusColumn {
  status: RoomStatus;
  label: string;
  headerBg: string;
  labelColor: string;
  badgeBg: string;
  badgeColor: string;
}

@Component({
  selector: 'app-room-status-board',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, MatButtonModule, MatIconModule, FormatTypePipe],
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
    .room-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 10px 12px;
      transition: border-color 0.15s;
    }
    .room-card:hover { border-color: var(--border-strong); }
    .room-card.updating { opacity: 0.6; pointer-events: none; }
  `],
  template: `
    <div>

      <!-- Page header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow mb-1">Front desk</p>
          <h2 style="color: var(--fg)">Room status board</h2>
        </div>
        <div class="flex items-center gap-3">
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
          <button mat-stroked-button type="button" (click)="reload()"
                  [disabled]="loading()"
                  style="border-color: var(--border-strong); color: var(--fg-2)">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px; vertical-align: middle; margin-right: 4px">refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Skeleton loading -->
      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (i of [0, 1, 2, 3]; track i) {
            <div class="skeleton" style="height: 240px"></div>
          }
        </div>
      }

      <!-- Kanban columns -->
      @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (col of columns; track col.status) {
            <div class="rounded-xl overflow-hidden" style="border: 1px solid var(--border)">

              <!-- Column header -->
              <div class="flex items-center justify-between px-4 py-3"
                   [style.background]="col.headerBg">
                <span class="text-sm font-semibold" [style.color]="col.labelColor">{{ col.label }}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                      [style.background]="col.badgeBg"
                      [style.color]="col.badgeColor">
                  {{ roomsByStatus(col.status).length }}
                </span>
              </div>

              <!-- Room cards -->
              <div class="p-2 space-y-1.5" style="min-height: 64px; background: var(--surface)">
                @for (r of roomsByStatus(col.status); track r.id) {
                  <div [class]="'room-card' + (updating()[r.id] ? ' updating' : '')">
                    <div class="flex items-start justify-between gap-1 mb-2">
                      <div class="min-w-0">
                        <p class="font-bold text-sm leading-tight"
                           style="font-family: var(--font-mono); color: var(--fg)">
                          {{ r.roomNumber }}
                        </p>
                        <p class="text-xs mt-0.5" style="color: var(--fg-3)">
                          {{ r.type | formatType }} · Fl. {{ r.floorNumber }}
                        </p>
                      </div>
                      <span class="text-xs shrink-0 mt-0.5" style="color: var(--fg-3)">
                        {{ r.capacity }} <mat-icon style="font-size: 12px; width: 12px; height: 12px; vertical-align: middle">person</mat-icon>
                      </span>
                    </div>
                    <mat-form-field appearance="outline" style="width: 100%; font-size: 12px">
                      <mat-select [value]="r.status"
                                  [disabled]="!!updating()[r.id]"
                                  (valueChange)="changeStatus(r, $event)">
                        @for (s of ROOM_STATUSES; track s) {
                          <mat-option [value]="s" style="font-size: 13px">
                            {{ s | formatType }}
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                }

                @if (roomsByStatus(col.status).length === 0) {
                  <p class="text-xs text-center py-6" style="color: var(--fg-3)">None</p>
                }
              </div>
            </div>
          }
        </div>

        <!-- Summary footer -->
        <p class="mt-4 text-xs text-right" style="color: var(--fg-3)">
          {{ rooms().length }} rooms total
          @if (selectedHotel(); as h) { · {{ h.name }} }
        </p>
      }

    </div>
  `,
})
export class RoomStatusBoardComponent {
  private readonly hotelsApi = inject(HotelsApiService);
  private readonly notify    = inject(NotificationService);

  readonly ROOM_STATUSES = ROOM_STATUSES;

  readonly hotels          = signal<HotelSummaryDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly rooms           = signal<RoomDto[]>([]);
  readonly loading         = signal(true);
  readonly updating        = signal<Record<number, boolean>>({});

  readonly selectedHotel = computed(() =>
    this.hotels().find(h => h.id === this.selectedHotelId()) ?? null
  );

  readonly byStatus = computed(() => {
    const map = new Map<RoomStatus, RoomDto[]>();
    for (const s of ROOM_STATUSES) map.set(s, []);
    for (const r of this.rooms()) {
      const key = r.status as RoomStatus;
      if (map.has(key)) map.get(key)!.push(r);
    }
    return map;
  });

  readonly columns: StatusColumn[] = [
    { status: 'Available',    label: 'Available',     headerBg: 'var(--glass-100)', labelColor: 'var(--glass-700)', badgeBg: 'var(--glass-500)',  badgeColor: 'var(--white)' },
    { status: 'Occupied',     label: 'Occupied',      headerBg: 'var(--azure-100)', labelColor: 'var(--azure-700)', badgeBg: 'var(--azure-500)',  badgeColor: 'var(--white)' },
    { status: 'Cleaning',     label: 'Cleaning',      headerBg: 'var(--clay-50)',   labelColor: 'var(--clay-600)',  badgeBg: 'var(--clay-500)',   badgeColor: 'var(--white)' },
    { status: 'OutOfService', label: 'Out of Service',headerBg: 'var(--bg-alt)',    labelColor: 'var(--fg-3)',      badgeBg: 'var(--bg-sunk)',    badgeColor: 'var(--fg-2)'  },
  ];

  constructor() {
    this.hotelsApi.getAll().subscribe({
      next: (list) => {
        this.hotels.set(list);
        if (list.length) {
          this.selectedHotelId.set(list[0]!.id);
          this.loadRooms(list[0]!.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Failed to load hotels.');
      },
    });
  }

  roomsByStatus(status: RoomStatus): RoomDto[] {
    return this.byStatus().get(status) ?? [];
  }

  selectHotel(hotelId: number): void {
    this.selectedHotelId.set(hotelId);
    this.loadRooms(hotelId);
  }

  reload(): void {
    const id = this.selectedHotelId();
    if (id) this.loadRooms(id);
  }

  changeStatus(room: RoomDto, newStatus: RoomStatus): void {
    if (room.status === newStatus) return;
    const hotelId = this.selectedHotelId();
    if (!hotelId) return;

    this.updating.update(u => ({ ...u, [room.id]: true }));
    this.hotelsApi.updateRoomStatus(hotelId, room.id, newStatus).subscribe({
      next: (updated) => {
        this.rooms.update(rs => rs.map(r => r.id === updated.id ? updated : r));
        this.updating.update(u => ({ ...u, [room.id]: false }));
        this.notify.success(`Room ${room.roomNumber} → ${newStatus}`);
      },
      error: () => {
        this.updating.update(u => ({ ...u, [room.id]: false }));
        this.notify.error(`Failed to update room ${room.roomNumber}.`);
      },
    });
  }

  private loadRooms(hotelId: number): void {
    this.loading.set(true);
    this.hotelsApi.getRooms(hotelId).subscribe({
      next:  (r) => { this.rooms.set(r); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.notify.error('Failed to load rooms.'); },
    });
  }
}
