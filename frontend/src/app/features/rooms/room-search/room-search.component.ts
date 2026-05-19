// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { RoomsApiService } from '../../../core/services/rooms-api.service';
import { FormatTypePipe } from '../../../shared/pipes/format-type.pipe';
import type { HotelSummaryDto } from '../../../core/models/hotel.models';
import type { RoomSearchResultItem } from '../../../core/models/room.models';

const ROOM_TYPES = [
  'StandardDouble', 'DeluxeKing', 'JuniorSuite', 'FamilySuite',
  'ExecutiveSuite', 'GrandSuite', 'PenthouseSuite', 'PresidentialSuite',
];

function toYmd(d: Date): string {
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-room-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    FormatTypePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ─── HERO ─── -->
    <section style="position: relative; min-height: 58vh; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; padding-bottom: 64px;">
      <img
        src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80"
        alt=""
        style="pointer-events: none; position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"
        loading="eager"
      />
      <div
        style="pointer-events: none; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,36,48,0.3) 0%, rgba(14,36,48,0.08) 40%, rgba(14,36,48,0.82) 100%);"
        aria-hidden="true"
      ></div>

      <div class="container-wide" style="position: relative; z-index: 10;">
        <p class="eyebrow" style="color: var(--clay-200); letter-spacing: var(--ls-widest);">Advanced Room Search</p>
        <h1 style="font-family: var(--font-display); font-size: clamp(36px,5vw,64px); font-weight: 300; letter-spacing: -0.03em; line-height: 1.05; color: var(--sand-50); max-width: 700px; margin: 12px 0 0; text-wrap: balance;">
          Find exactly what you're looking for
        </h1>
        <p class="lead" style="color: var(--sand-100); max-width: 520px; margin: 14px 0 0;">
          Filter by hotel, room type, price range, and capacity to find the room that fits perfectly.
        </p>

        <!-- Advanced search widget -->
        <div [formGroup]="searchForm" style="margin-top: 28px; background: var(--surface); border-radius: var(--r-lg); padding: 24px 28px; max-width: 1000px; box-shadow: var(--shadow-lg);">
          <!-- Row 1: dates + guests + hotel -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;" class="widget-row-1">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Check-in</mat-label>
              <input matInput [matDatepicker]="ci" [min]="minDate" formControlName="checkIn" />
              <mat-datepicker-toggle matIconSuffix [for]="ci" />
              <mat-datepicker #ci />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Check-out</mat-label>
              <input matInput [matDatepicker]="co" [min]="minDate" formControlName="checkOut" />
              <mat-datepicker-toggle matIconSuffix [for]="co" />
              <mat-datepicker #co />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Guests</mat-label>
              <mat-select formControlName="guests">
                <mat-option [value]="null">Any</mat-option>
                <mat-option [value]="1">1 guest</mat-option>
                <mat-option [value]="2">2 guests</mat-option>
                <mat-option [value]="3">3 guests</mat-option>
                <mat-option [value]="4">4 guests</mat-option>
                <mat-option [value]="5">5+ guests</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Hotel</mat-label>
              <mat-select formControlName="hotelName">
                <mat-option [value]="null">Any hotel</mat-option>
                @for (h of hotels(); track h.id) {
                  <mat-option [value]="h.name">{{ h.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Row 2: filters + search button -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; margin-top: 4px; align-items: flex-start;" class="widget-row-2">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Room type</mat-label>
              <mat-select formControlName="roomType">
                <mat-option [value]="null">Any type</mat-option>
                @for (t of roomTypes; track t) {
                  <mat-option [value]="t">{{ t | formatType }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Min price ($/night)</mat-label>
              <input matInput type="number" formControlName="minPrice" min="0" placeholder="0" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Max price ($/night)</mat-label>
              <input matInput type="number" formControlName="maxPrice" min="0" placeholder="No limit" />
            </mat-form-field>
            <div style="display: flex; align-items: flex-end; padding-bottom: 1px;">
              <button
                type="button"
                (click)="search()"
                [disabled]="loading()"
                class="btn btn-primary btn-lg"
                style="height: 56px; white-space: nowrap;"
              >
                <span class="material-icons-outlined" style="font-size: 18px;" aria-hidden="true">search</span>
                Search
              </button>
            </div>
          </div>
        </div>

        @if (dateError()) {
          <div style="margin-top: 12px; padding: 12px 14px; background: var(--clay-100); border-radius: var(--r-md); font-size: var(--fs-sm); color: var(--clay-700); max-width: 1000px;">
            {{ dateError() }}
          </div>
        }
      </div>
    </section>

    <!-- ─── RESULTS ─── -->
    <section style="background: var(--bg-alt); padding: 64px 0; min-height: 320px;">
      <div class="container-wide">
        @if (loading()) {
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;" class="results-grid">
            @for (s of [1,2,3,4,5,6]; track s) {
              <div style="animation: pulse 1.5s ease-in-out infinite; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px;">
                <div style="height: 14px; width: 75%; background: var(--sand-200); border-radius: 4px; margin-bottom: 12px;"></div>
                <div style="height: 12px; width: 50%; background: var(--sand-100); border-radius: 4px; margin-bottom: 24px;"></div>
                <div style="height: 40px; width: 100%; background: var(--sand-100); border-radius: 4px;"></div>
              </div>
            }
          </div>
        } @else if (searched() && results().length === 0) {
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; text-align: center;">
            <span class="material-icons-outlined" style="font-size: 48px; color: var(--sand-300);" aria-hidden="true">search_off</span>
            <p style="margin-top: 20px; font-family: var(--font-display); font-size: var(--fs-xl); color: var(--fg);">No rooms found</p>
            <p style="margin-top: 8px; font-size: var(--fs-sm); color: var(--fg-3);">Try widening your filters — a different type, broader price range, or fewer guests.</p>
          </div>
        } @else if (results().length) {
          <div style="margin-bottom: 32px; display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 400; color: var(--fg); margin: 0;">Available rooms</h2>
              <p style="margin-top: 4px; font-size: var(--fs-xs); color: var(--fg-3);">
                {{ results().length }} room{{ results().length === 1 ? '' : 's' }} match your filters
              </p>
            </div>
            @if (activeFilterCount() > 0) {
              <button type="button" (click)="clearFilters()" class="btn btn-secondary btn-sm">
                <span class="material-icons-outlined" style="font-size: 14px;">close</span>
                Clear filters ({{ activeFilterCount() }})
              </button>
            }
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;" class="results-grid">
            @for (room of results(); track room.roomId) {
              <div class="room-card card-surface" style="overflow: hidden; transition: box-shadow var(--dur-slow) var(--ease-glide);">
                @if (room.imageUrl) {
                  <img
                    [src]="room.imageUrl"
                    [alt]="room.type"
                    style="width: 100%; height: 180px; object-fit: cover; display: block;"
                  />
                } @else {
                  <div style="width: 100%; height: 180px; background: var(--sand-100); display: flex; align-items: center; justify-content: center;">
                    <span class="material-icons-outlined" style="font-size: 40px; color: var(--sand-300);">bed</span>
                  </div>
                }
                <div style="padding: 20px 22px 12px;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                    <div>
                      <span class="badge badge-info">{{ room.type | formatType }}</span>
                      <p style="margin: 8px 0 0; font-size: var(--fs-sm); color: var(--fg-2);">{{ room.hotelName }}</p>
                      <p style="font-size: var(--fs-xs); color: var(--fg-3);">{{ room.city }}, {{ room.country }}</p>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                      <span class="price" style="font-size: 24px;">&#36;{{ room.pricePerNight }}</span>
                      <p class="price-unit" style="display: block; margin: 0;">/ night</p>
                    </div>
                  </div>
                </div>
                <p style="padding: 0 22px; font-size: 13px; line-height: 1.55; color: var(--fg-3); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ room.description }}</p>
                <div class="rule" style="margin: 16px 0 0;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 22px;">
                  <div style="display: flex; align-items: center; gap: 12px; font-size: var(--fs-xs); color: var(--fg-3);">
                    <span style="display: flex; align-items: center; gap: 4px;">
                      <span class="material-icons-outlined" style="font-size: 14px;">person</span>
                      {{ room.capacity }} guest{{ room.capacity === 1 ? '' : 's' }}
                    </span>
                    <span style="display: flex; align-items: center; gap: 4px;">
                      <span class="material-icons-outlined" style="font-size: 14px;">layers</span>
                      Floor {{ room.floorNumber }}
                    </span>
                  </div>
                  <a
                    [routerLink]="['/rooms', room.roomId]"
                    [queryParams]="lastSearch()"
                    class="btn btn-primary btn-sm"
                  >View details</a>
                </div>
              </div>
            }
          </div>
        } @else {
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; text-align: center;">
            <span class="material-icons-outlined" style="font-size: 48px; color: var(--sand-300);" aria-hidden="true">tune</span>
            <p style="margin-top: 20px; font-family: var(--font-display); font-size: var(--fs-xl); color: var(--fg);">Set your filters and search</p>
            <p style="margin-top: 8px; font-size: var(--fs-sm); color: var(--fg-3);">Use the filters above to narrow down rooms by hotel, type, price, and availability.</p>
          </div>
        }
      </div>
    </section>

    <style>
      @media (max-width: 900px) {
        .widget-row-1 { grid-template-columns: 1fr 1fr !important; }
        .widget-row-2 { grid-template-columns: 1fr 1fr !important; }
        .widget-row-2 > div:last-child { grid-column: span 2; }
      }
      @media (max-width: 540px) {
        .widget-row-1 { grid-template-columns: 1fr !important; }
        .widget-row-2 { grid-template-columns: 1fr !important; }
        .widget-row-2 > div:last-child { grid-column: span 1; }
      }
      @media (max-width: 768px) {
        .results-grid { grid-template-columns: 1fr !important; }
      }
      .room-card:hover { box-shadow: var(--shadow-md) !important; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  `,
})
export class RoomSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hotelsApi = inject(HotelsApiService);
  private readonly roomsApi = inject(RoomsApiService);

  readonly roomTypes = ROOM_TYPES;
  readonly hotels = signal<HotelSummaryDto[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly results = signal<RoomSearchResultItem[]>([]);
  readonly dateError = signal<string | null>(null);
  readonly lastSearch = signal<{ checkIn?: string; checkOut?: string; guests?: number }>({});
  readonly minDate = new Date();

  readonly searchForm = this.fb.nonNullable.group({
    checkIn:   [new Date()],
    checkOut:  [new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)],
    guests:    [null as number | null],
    hotelName: [null as string | null],
    roomType:  [null as string | null],
    minPrice:  [null as number | null],
    maxPrice:  [null as number | null],
  });

  readonly activeFilterCount = () => {
    const v = this.searchForm.getRawValue();
    return [v.hotelName, v.roomType, v.minPrice, v.maxPrice].filter(x => x != null).length;
  };

  constructor() {
    this.hotelsApi.getAll().subscribe({
      next: (h) => this.hotels.set(h),
      error: () => this.hotels.set([]),
    });
  }

  search(): void {
    this.dateError.set(null);
    const v = this.searchForm.getRawValue();
    if (!v.checkIn)  { this.dateError.set('Please select a check-in date.'); return; }
    if (!v.checkOut) { this.dateError.set('Please select a check-out date.'); return; }
    if (v.checkOut <= v.checkIn) { this.dateError.set('Check-out must be after check-in.'); return; }
    if (this.loading()) return;

    const checkInStr  = toYmd(v.checkIn);
    const checkOutStr = toYmd(v.checkOut);

    this.lastSearch.set({ checkIn: checkInStr, checkOut: checkOutStr, guests: v.guests ?? undefined });
    this.loading.set(true);
    this.searched.set(true);
    this.results.set([]);

    this.roomsApi.searchRooms({
      location: v.hotelName ?? undefined,
      checkIn:  checkInStr,
      checkOut: checkOutStr,
      guests:   v.guests    ?? undefined,
      roomType: v.roomType  ?? undefined,
      minPrice: v.minPrice  ?? undefined,
      maxPrice: v.maxPrice  ?? undefined,
    }).subscribe({
      next:  (r) => { this.results.set(r.results); this.loading.set(false); },
      error: ()  => { this.results.set([]);         this.loading.set(false); },
    });
  }

  clearFilters(): void {
    this.searchForm.patchValue({ hotelName: null, roomType: null, minPrice: null, maxPrice: null });
    if (this.searched()) this.search();
  }
}
