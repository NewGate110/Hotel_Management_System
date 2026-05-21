// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogService } from '../../../core/services/dialog.service';
import type { CreateHotelDto, HotelDto } from '../../../core/models/hotel.models';
import type { CreateRoomDto, RoomDto } from '../../../core/models/room.models';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';

// ── Create Hotel Dialog ──────────────────────────────────────────────────────

@Component({
  selector: 'app-create-hotel-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title style="font-family: var(--font-display); font-weight: 300; color: var(--fg);">Add Hotel</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="grid gap-4 pt-2 md:grid-cols-2" style="min-width: 480px;">
        <mat-form-field appearance="outline" class="md:col-span-2">
          <mat-label>Hotel name</mat-label>
          <input matInput formControlName="name" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
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
        <mat-form-field appearance="outline" class="md:col-span-2">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Contact email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="md:col-span-2">
          <mat-label>Image URL (optional)</mat-label>
          <input matInput formControlName="imageUrl" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap: 8px; padding-bottom: 16px; padding-right: 24px;">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Create Hotel</button>
    </mat-dialog-actions>
  `,
})
export class CreateHotelDialogComponent {
  readonly ref = inject(MatDialogRef<CreateHotelDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name:     ['', Validators.required],
    city:     [''],
    country:  [''],
    address:  [''],
    phone:    [''],
    email:    ['', Validators.email],
    imageUrl: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CreateHotelDto = {
      name:     v.name,
      city:     v.city,
      country:  v.country,
      address:  v.address,
      phone:    v.phone,
      email:    v.email,
      imageUrl: v.imageUrl || undefined,
    };
    this.ref.close(dto);
  }
}

// ── Create Room Dialog ───────────────────────────────────────────────────────

const ROOM_TYPES = [
  'StandardDouble', 'DeluxeKing', 'FamilySuite',
  'BeachVilla', 'WaterVilla', 'OverwaterBungalow',
  'HoneymoonVilla', 'PresidentialVilla',
];

@Component({
  selector: 'app-create-room-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title style="font-family: var(--font-display); font-weight: 300; color: var(--fg);">Add Room</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="grid gap-4 pt-2 md:grid-cols-2" style="min-width: 520px;">
        <mat-form-field appearance="outline">
          <mat-label>Room number</mat-label>
          <input matInput formControlName="roomNumber" />
          @if (form.get('roomNumber')?.invalid && form.get('roomNumber')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Room type</mat-label>
          <mat-select formControlName="type">
            @for (t of roomTypes; track t) {
              <mat-option [value]="t">{{ t }}</mat-option>
            }
          </mat-select>
          @if (form.get('type')?.invalid && form.get('type')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Capacity (guests)</mat-label>
          <input matInput type="number" min="1" formControlName="capacity" />
          @if (form.get('capacity')?.invalid && form.get('capacity')?.touched) {
            <mat-error>Min 1</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Floor number</mat-label>
          <input matInput type="number" min="0" formControlName="floorNumber" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Off-peak price ($/night)</mat-label>
          <input matInput type="number" step="0.01" min="0.01" formControlName="priceOffPeak" />
          @if (form.get('priceOffPeak')?.invalid && form.get('priceOffPeak')?.touched) {
            <mat-error>Required, min 0.01</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Peak price ($/night)</mat-label>
          <input matInput type="number" step="0.01" min="0.01" formControlName="pricePeak" />
          @if (form.get('pricePeak')?.invalid && form.get('pricePeak')?.touched) {
            <mat-error>Required, min 0.01</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="md:col-span-2">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="md:col-span-2">
          <mat-label>Image URL (optional)</mat-label>
          <input matInput formControlName="imageUrl" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap: 8px; padding-bottom: 16px; padding-right: 24px;">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Add Room</button>
    </mat-dialog-actions>
  `,
})
export class CreateRoomDialogComponent {
  readonly ref = inject(MatDialogRef<CreateRoomDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly roomTypes = ROOM_TYPES;

  readonly form = this.fb.nonNullable.group({
    roomNumber:   ['', Validators.required],
    type:         ['', Validators.required],
    capacity:     [1, [Validators.required, Validators.min(1)]],
    floorNumber:  [0],
    priceOffPeak: [0.01, [Validators.required, Validators.min(0.01)]],
    pricePeak:    [0.01, [Validators.required, Validators.min(0.01)]],
    description:  [''],
    imageUrl:     [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CreateRoomDto = {
      roomNumber:   v.roomNumber,
      type:         v.type,
      capacity:     v.capacity,
      floorNumber:  v.floorNumber,
      priceOffPeak: v.priceOffPeak,
      pricePeak:    v.pricePeak,
      description:  v.description,
      imageUrl:     v.imageUrl || undefined,
    };
    this.ref.close(dto);
  }
}

// ── Hotel Config Component ───────────────────────────────────────────────────

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
    MatButtonModule,
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
    } @else {
      <!-- Hotel selector pills + Add Hotel button -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 24px;">
        @for (h of hotels(); track h.id) {
          <div class="hotel-pill-wrap" style="position: relative; display: inline-flex; align-items: center; gap: 4px;">
            <button
              type="button"
              style="border-radius: var(--r-pill); padding: 6px 16px; font-size: var(--fs-sm); font-weight: 500; cursor: pointer; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);"
              [style.background]="selectedHotelId() === h.id ? 'var(--sand-900)' : 'var(--surface)'"
              [style.color]="selectedHotelId() === h.id ? 'var(--sand-50)' : 'var(--fg-2)'"
              [style.border]="selectedHotelId() === h.id ? '1px solid var(--sand-900)' : '1px solid var(--border-strong)'"
              (click)="selectHotel(h.id)">
              {{ h.name }}
            </button>
            <button
              type="button"
              mat-icon-button
              class="pill-delete-btn"
              title="Delete hotel"
              [disabled]="deletingHotel()"
              style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: none; background: transparent; cursor: pointer; color: var(--accent); padding: 0; opacity: 0.7; transition: opacity var(--dur-fast);"
              (click)="deleteHotel(h); $event.stopPropagation()">
              <span class="material-icons-outlined" style="font-size: 15px;">delete</span>
            </button>
          </div>
        }

        @if (hotels().length === 0 && !loading()) {
          <p style="font-size: var(--fs-sm); color: var(--fg-3);">No hotels found.</p>
        }

        <button
          type="button"
          style="border-radius: var(--r-pill); padding: 6px 16px; font-size: var(--fs-sm); font-weight: 500; cursor: pointer; background: var(--surface); color: var(--brand); border: 1px dashed var(--brand); display: inline-flex; align-items: center; gap: 6px; transition: background var(--dur-fast);"
          (click)="openCreateHotel()">
          <span class="material-icons-outlined" style="font-size: 15px;">add</span>
          Add Hotel
        </button>
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

            <!-- Hotel image URL editor -->
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
              <p style="font-size: var(--fs-sm); font-weight: 500; color: var(--fg); margin: 0 0 10px;">Hotel image</p>
              <div style="display: flex; gap: 10px; align-items: center;">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  [value]="hotelImageUrl()"
                  (input)="hotelImageUrl.set($any($event.target).value)"
                  style="flex: 1; border-radius: var(--r-md); border: 1px solid var(--border); background: var(--surface); color: var(--fg); padding: 8px 12px; font-size: var(--fs-sm); outline: none;"
                />
                <app-button variant="secondary" type="button"
                  [loading]="savingImage()"
                  (click)="saveHotelImage()">
                  <span class="material-icons-outlined" style="font-size: 15px;">image</span>
                  Save image
                </app-button>
              </div>
              @if (hotelImageUrl()) {
                <img [src]="hotelImageUrl()" alt="Hotel preview"
                  style="margin-top: 10px; height: 80px; border-radius: var(--r-md); object-fit: cover; max-width: 240px; border: 1px solid var(--border);"
                  (error)="$any($event.target).style.display='none'"
                />
              }
            </div>

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
            } @else {
              <!-- Add Room button -->
              <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
                <button
                  type="button"
                  style="border-radius: var(--r-md); padding: 6px 14px; font-size: var(--fs-sm); font-weight: 500; cursor: pointer; background: var(--surface); color: var(--brand); border: 1px dashed var(--brand); display: inline-flex; align-items: center; gap: 6px; transition: background var(--dur-fast);"
                  (click)="openCreateRoom()">
                  <span class="material-icons-outlined" style="font-size: 15px;">add</span>
                  Add Room
                </button>
              </div>

              @if (pricingRows().length === 0) {
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
                        <th style="padding: 10px 0; width: 36px;"></th>
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
                          <td style="padding: 10px 0 10px 8px;">
                            <button
                              type="button"
                              title="Delete room"
                              [disabled]="deletingRoom() === row.room.id"
                              style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: var(--r-md); border: none; background: transparent; cursor: pointer; color: var(--accent); padding: 0; opacity: 0.7; transition: opacity var(--dur-fast);"
                              (click)="deleteRoom(row)">
                              <span class="material-icons-outlined" style="font-size: 16px;">delete</span>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
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
  private readonly dialogs   = inject(DialogService);
  private readonly fb        = inject(FormBuilder);

  readonly loading         = signal(true);
  readonly loadingRooms    = signal(false);
  readonly savingHotel     = signal(false);
  readonly savingImage     = signal(false);
  readonly deletingHotel   = signal(false);
  readonly deletingRoom    = signal<number | null>(null);
  readonly hotels          = signal<HotelDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly pricingRows     = signal<RoomPricingRow[]>([]);
  readonly hotelImageUrl   = signal('');

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
    this.adminApi.getHotels().subscribe({
      next: (summaries) => {
        if (summaries.length === 0) { this.loading.set(false); return; }
        this.hotels.set(summaries.map(s => ({
          id: s.id, name: s.name, city: s.city, country: s.country,
          address: '', phone: '', email: '', isActive: true,
        })));
        this.loading.set(false);
        this.selectHotel(summaries[0]!.id);
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

    this.hotelsApi.getById(id).subscribe({
      next: (hotel) => {
        this.hotels.update(list => list.map(h => h.id === id ? hotel : h));
        this.hotelForm.patchValue(hotel);
        this.hotelImageUrl.set(hotel.imageUrl ?? '');
      },
    });

    this.hotelsApi.getRooms(id).subscribe({
      next: (rooms) => {
        this.pricingRows.set(rooms.map(r => ({
          room: r, offPeak: r.priceOffPeak, peak: r.pricePeak, saving: false,
        })));
        this.loadingRooms.set(false);
      },
      error: () => this.loadingRooms.set(false),
    });
  }

  openCreateHotel(): void {
    this.dialogs.open<CreateHotelDialogComponent, void, CreateHotelDto>(
      CreateHotelDialogComponent,
      { width: '560px' },
    ).subscribe((dto) => {
      if (!dto) return;
      this.adminApi.createHotel(dto).subscribe({
        next: (created) => {
          this.hotels.update(arr => [...arr, created]);
          this.notify.success(`Hotel "${created.name}" created.`);
          this.selectHotel(created.id);
        },
        error: () => this.notify.error('Failed to create hotel.'),
      });
    });
  }

  deleteHotel(hotel: HotelDto): void {
    this.dialogs.confirm({
      title: 'Delete hotel?',
      message: `"${hotel.name}" will be hidden from guests. This cannot be undone.`,
      confirmLabel: 'Delete',
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.deletingHotel.set(true);
      this.adminApi.deleteHotel(hotel.id).subscribe({
        next: () => {
          this.hotels.update(arr => arr.filter(h => h.id !== hotel.id));
          this.notify.success(`Hotel "${hotel.name}" deleted.`);
          this.deletingHotel.set(false);
          if (this.selectedHotelId() === hotel.id) {
            const remaining = this.hotels();
            if (remaining.length > 0) {
              this.selectHotel(remaining[0].id);
            } else {
              this.selectedHotelId.set(null);
              this.pricingRows.set([]);
            }
          }
        },
        error: () => {
          this.notify.error('Failed to delete hotel.');
          this.deletingHotel.set(false);
        },
      });
    });
  }

  openCreateRoom(): void {
    const hotelId = this.selectedHotelId();
    if (!hotelId) return;
    this.dialogs.open<CreateRoomDialogComponent, void, CreateRoomDto>(
      CreateRoomDialogComponent,
      { width: '600px' },
    ).subscribe((dto) => {
      if (!dto) return;
      this.adminApi.createRoom(hotelId, dto).subscribe({
        next: (room) => {
          this.pricingRows.update(rows => [...rows, {
            room, offPeak: room.priceOffPeak, peak: room.pricePeak, saving: false,
          }]);
          this.notify.success(`Room ${room.roomNumber} added.`);
        },
        error: () => this.notify.error('Failed to add room.'),
      });
    });
  }

  deleteRoom(row: RoomPricingRow): void {
    this.dialogs.confirm({
      title: 'Remove room?',
      message: `Room ${row.room.roomNumber} will be permanently deleted. This cannot be undone.`,
      confirmLabel: 'Delete',
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.deletingRoom.set(row.room.id);
      this.adminApi.deleteRoom(row.room.id).subscribe({
        next: () => {
          this.pricingRows.update(rows => rows.filter(r => r.room.id !== row.room.id));
          this.notify.success(`Room ${row.room.roomNumber} deleted.`);
          this.deletingRoom.set(null);
        },
        error: (err) => {
          const msg = err?.error?.message ?? '';
          if (msg.includes('active or future bookings')) {
            this.notify.error('Cannot delete — room has active or future bookings.');
          } else {
            this.notify.error('Failed to delete room.');
          }
          this.deletingRoom.set(null);
        },
      });
    });
  }

  saveHotelImage(): void {
    const id = this.selectedHotelId();
    if (!id) return;
    this.savingImage.set(true);
    const url = this.hotelImageUrl().trim() || null;
    this.adminApi.updateHotelImage(id, url).subscribe({
      next: (updated) => {
        this.hotels.update(list => list.map(h => h.id === id ? updated : h));
        this.notify.success('Hotel image updated.');
        this.savingImage.set(false);
      },
      error: () => {
        this.notify.error('Failed to update hotel image.');
        this.savingImage.set(false);
      },
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
