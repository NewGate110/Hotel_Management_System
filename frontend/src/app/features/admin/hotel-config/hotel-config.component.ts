// Author: Salaams
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { HotelDto } from '../../../core/models/hotel.models';
import type { RoomDto } from '../../../core/models/room.models';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';

interface RoomPricingRow {
  room: RoomDto;
  offPeak: number;
  peak: number;
  saving: boolean;
}

@Component({
  selector: 'app-hotel-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    AppLoaderComponent,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page header -->
    <div style="padding-bottom: 24px; border-bottom: 1px solid var(--border); margin-bottom: 28px;">
      <p class="eyebrow">Administration</p>
      <h1 style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 0;">Hotel Configuration</h1>
    </div>

    @if (loading()) {
      <app-loader />
    } @else if (hotels().length === 0) {
      <p style="font-size: var(--fs-sm); color: var(--fg-3);">No hotels found.</p>
    } @else {
      <!-- Hotel selector pills -->
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
        @for (h of hotels(); track h.id) {
          <button
            type="button"
            style="border-radius: var(--r-pill); padding: 6px 16px; font-size: var(--fs-sm); font-weight: 500; cursor: pointer; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);"
            [style.background]="selectedHotelId() === h.id ? 'var(--sand-900)' : 'var(--surface)'"
            [style.color]="selectedHotelId() === h.id ? 'var(--sand-50)' : 'var(--fg-2)'"
            [style.border]="selectedHotelId() === h.id ? '1px solid var(--sand-900)' : '1px solid var(--border-strong)'"
            (click)="selectHotel(h.id)">
            {{ h.name }}
          </button>
        }
      </div>

      @if (selectedHotel()) {
        <mat-accordion multi>

          <!-- ── Hotel Details ────────────────────────────────────────────── -->
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title style="font-weight: 500; color: var(--fg);">Hotel Details</mat-panel-title>
            </mat-expansion-panel-header>

            <form [formGroup]="hotelForm" class="grid gap-4 py-2 md:grid-cols-2">
              <mat-form-field appearance="outline">
                <mat-label>Hotel name</mat-label>
                <input matInput formControlName="name" />
                @if (hotelForm.get('name')?.invalid && hotelForm.get('name')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <input matInput formControlName="country" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contact email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <div style="display: flex; align-items: center; gap: 12px;">
                <mat-slide-toggle formControlName="isActive" color="primary">
                  Hotel active
                </mat-slide-toggle>
              </div>
            </form>

            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
              <app-button variant="primary" type="button"
                [loading]="savingHotel()"
                [disabled]="hotelForm.invalid"
                (click)="saveHotel()">
                <span class="material-icons-outlined" style="font-size: 15px;">save</span>
                Save hotel details
              </app-button>
            </div>
          </mat-expansion-panel>

          <!-- ── Room Pricing ────────────────────────────────────────────── -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title style="font-weight: 500; color: var(--fg);">Room Pricing</mat-panel-title>
              <mat-panel-description style="color: var(--fg-3);">Off-peak &amp; peak rates per room</mat-panel-description>
            </mat-expansion-panel-header>

            @if (loadingRooms()) {
              <app-loader />
            } @else if (pricingRows().length === 0) {
              <p style="padding: 16px 0; font-size: var(--fs-sm); color: var(--fg-3);">No rooms configured for this hotel.</p>
            } @else {
              <div style="overflow-x: auto;">
                <table style="width: 100%; font-size: var(--fs-sm); border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border); text-align: left;">
                      <th style="padding: 10px 16px 10px 0; font-size: 11px; letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--fg-3); font-weight: 500;">Room</th>
                      <th style="padding: 10px 16px 10px 0; font-size: 11px; letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--fg-3); font-weight: 500;">Type</th>
                      <th style="padding: 10px 16px 10px 0; font-size: 11px; letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--fg-3); font-weight: 500;">Off-peak ($/night)</th>
                      <th style="padding: 10px 16px 10px 0; font-size: 11px; letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--fg-3); font-weight: 500;">Peak ($/night)</th>
                      <th style="padding: 10px 0;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of pricingRows(); track row.room.id; let i = $index) {
                      <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 10px 16px 10px 0; font-family: var(--font-mono); font-size: 12px; color: var(--fg);">{{ row.room.roomNumber }}</td>
                        <td style="padding: 10px 16px 10px 0; color: var(--fg-2);">{{ row.room.type }}</td>
                        <td style="padding: 10px 16px 10px 0;">
                          <input type="number" step="0.01" min="0.01"
                            style="width: 96px; border-radius: var(--r-md); border: 1px solid var(--border); background: var(--surface); color: var(--fg); padding: 5px 10px; font-size: var(--fs-sm); outline: none; transition: border-color var(--dur-fast) var(--ease-out);"
                            [value]="row.offPeak"
                            (focus)="$any($event.target).style.borderColor='var(--brand)'"
                            (blur)="$any($event.target).style.borderColor='var(--border)'"
                            (change)="updateOffPeak(i, $event)" />
                        </td>
                        <td style="padding: 10px 16px 10px 0;">
                          <input type="number" step="0.01" min="0.01"
                            style="width: 96px; border-radius: var(--r-md); border: 1px solid var(--border); background: var(--surface); color: var(--fg); padding: 5px 10px; font-size: var(--fs-sm); outline: none; transition: border-color var(--dur-fast) var(--ease-out);"
                            [value]="row.peak"
                            (focus)="$any($event.target).style.borderColor='var(--brand)'"
                            (blur)="$any($event.target).style.borderColor='var(--border)'"
                            (change)="updatePeak(i, $event)" />
                        </td>
                        <td style="padding: 10px 0;">
                          <app-button variant="secondary" type="button"
                            [loading]="row.saving"
                            (click)="saveRoomPricing(i)">
                            Save
                          </app-button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </mat-expansion-panel>

          <!-- ── Policies (informational) ───────────────────────────────── -->
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title style="font-weight: 500; color: var(--fg);">Policies</mat-panel-title>
            </mat-expansion-panel-header>
            <div style="display: flex; flex-direction: column; gap: 10px; padding: 8px 0; font-size: var(--fs-sm); color: var(--fg-2);">
              <p style="margin: 0;"><strong style="color: var(--fg);">VAT:</strong> 20% applied on checkout. Fixed by system — not configurable here.</p>
              <p style="margin: 0;"><strong style="color: var(--fg);">Cancellation:</strong> Free (&gt;14 days) · 50% (3–14 days) · 100% (&lt;72 h).</p>
              <p style="margin: 0;"><strong style="color: var(--fg);">Quiet hours:</strong> 22:00–07:00.</p>
              <p style="margin: 0;"><strong style="color: var(--fg);">Late checkout:</strong> Subject to availability.</p>
            </div>
          </mat-expansion-panel>

        </mat-accordion>
      }
    }
  `,
})
export class HotelConfigComponent {
  private readonly adminApi  = inject(AdminApiService);
  private readonly hotelsApi = inject(HotelsApiService);
  private readonly notify    = inject(NotificationService);
  private readonly fb        = inject(FormBuilder);

  readonly loading         = signal(true);
  readonly loadingRooms    = signal(false);
  readonly savingHotel     = signal(false);
  readonly hotels          = signal<HotelDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly pricingRows     = signal<RoomPricingRow[]>([]);

  readonly hotelForm = this.fb.nonNullable.group({
    name:     ['', Validators.required],
    city:     [''],
    country:  [''],
    address:  [''],
    phone:    [''],
    email:    [''],
    isActive: [true],
  });

  constructor() {
    // Load all hotels (admin endpoint returns all including inactive)
    this.adminApi.getHotels().subscribe({
      next: (summaries) => {
        // Load full hotel details for each (we need the full HotelDto)
        if (summaries.length === 0) { this.loading.set(false); return; }
        const first = summaries[0];
        this.hotelsApi.getById(first.id).subscribe({
          next: (h) => {
            // We only have full details for one at a time; build a light list
            this.hotels.set(summaries.map(s => ({
              id: s.id, name: s.name, city: s.city, country: s.country,
              address: '', phone: '', email: '', isActive: true,
            })));
            this.loading.set(false);
            this.selectHotel(first.id);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  selectedHotel(): HotelDto | null {
    return this.hotels().find(h => h.id === this.selectedHotelId()) ?? null;
  }

  selectHotel(id: number): void {
    this.selectedHotelId.set(id);
    this.loadingRooms.set(true);
    this.pricingRows.set([]);

    // Load full hotel details
    this.hotelsApi.getById(id).subscribe({
      next: (hotel) => {
        // Update the hotels list with the full details
        this.hotels.update(list => list.map(h => h.id === id ? hotel : h));
        this.hotelForm.patchValue(hotel);
      },
    });

    // Load rooms for pricing
    this.hotelsApi.getRooms(id).subscribe({
      next: (rooms) => {
        this.pricingRows.set(rooms.map(r => ({
          room: r,
          offPeak: r.priceOffPeak,
          peak: r.pricePeak,
          saving: false,
        })));
        this.loadingRooms.set(false);
      },
      error: () => this.loadingRooms.set(false),
    });
  }

  saveHotel(): void {
    this.hotelForm.markAllAsTouched();
    if (this.hotelForm.invalid) return;
    const id = this.selectedHotelId();
    if (!id) return;

    this.savingHotel.set(true);
    this.adminApi.updateHotel(id, this.hotelForm.getRawValue()).subscribe({
      next: (updated) => {
        this.hotels.update(list => list.map(h => h.id === id ? updated : h));
        this.notify.success('Hotel details saved.');
        this.savingHotel.set(false);
      },
      error: () => {
        this.notify.error('Failed to save hotel details.');
        this.savingHotel.set(false);
      },
    });
  }

  updateOffPeak(index: number, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.pricingRows.update(rows => rows.map((r, i) => i === index ? { ...r, offPeak: val } : r));
    }
  }

  updatePeak(index: number, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.pricingRows.update(rows => rows.map((r, i) => i === index ? { ...r, peak: val } : r));
    }
  }

  saveRoomPricing(index: number): void {
    const row = this.pricingRows()[index];
    this.pricingRows.update(rows => rows.map((r, i) => i === index ? { ...r, saving: true } : r));
    this.adminApi.updateRoomPricing(row.room.id, { priceOffPeak: row.offPeak, pricePeak: row.peak })
      .subscribe({
        next: () => {
          this.pricingRows.update(rows => rows.map((r, i) => i === index ? { ...r, saving: false } : r));
          this.notify.success(`Room ${row.room.roomNumber} pricing saved.`);
        },
        error: () => {
          this.pricingRows.update(rows => rows.map((r, i) => i === index ? { ...r, saving: false } : r));
          this.notify.error('Failed to save room pricing.');
        },
      });
  }
}
