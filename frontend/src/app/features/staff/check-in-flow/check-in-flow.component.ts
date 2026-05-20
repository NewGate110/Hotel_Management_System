// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { CheckInApiService } from '../../../core/services/checkin-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { BookingDto } from '../../../core/models/booking.models';

@Component({
  selector: 'app-check-in-flow',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .booking-card {
      display: flex; align-items: center; gap: 12px; width: 100%;
      text-align: left; cursor: pointer;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r-lg); padding: 12px 16px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .booking-card:hover {
      border-color: var(--brand);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .avatar {
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: var(--r-pill);
      background: var(--azure-100); color: var(--azure-700);
      font-size: 13px; font-weight: 700; font-family: var(--font-sans);
      display: flex; align-items: center; justify-content: center;
    }
    .count-pill {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: var(--r-pill);
      font-size: 11px; font-weight: 600;
      background: var(--azure-100); color: var(--azure-600);
    }
    .guest-pill {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: var(--r-pill);
      font-size: 11px; font-weight: 500;
      background: var(--bg-alt); color: var(--fg-2);
    }
    .room-chip {
      display: inline-flex; align-items: center;
      padding: 4px 12px; border-radius: var(--r-pill);
      font-size: 13px; font-weight: 600;
      background: var(--azure-100); color: var(--azure-700);
      font-family: var(--font-mono);
    }
    .skeleton {
      background: linear-gradient(90deg, var(--bg-alt) 25%, var(--bg-sunk) 50%, var(--bg-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: var(--r-lg);
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--r-lg); padding: 16px 20px;
    }
    .info-label { font-size: 11px; color: var(--fg-3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .info-value { font-size: var(--fs-sm); color: var(--fg); font-weight: 500; }
    .manual-summary {
      list-style: none;
      display: flex; align-items: center; gap: 6px;
      cursor: pointer; padding: 10px 14px;
      font-size: var(--fs-sm); color: var(--fg-2);
      border-radius: var(--r-lg);
    }
    .manual-summary:hover { background: var(--bg-alt); }
  `],
  template: `
    <div style="max-width: 680px">

      <!-- Page header -->
      <div class="mb-8">
        <p class="eyebrow mb-1">Front desk</p>
        <h2 style="color: var(--fg)">Check-in</h2>
      </div>

      <mat-stepper #stepper linear>

        <!-- ── Step 1: Select booking ─────────────────────────────────── -->
        <mat-step [completed]="!!booking()" label="Select booking" [editable]="!submitting()">
          <div class="py-5 space-y-4">

            <!-- Section header with count badge -->
            <div class="flex items-center gap-2">
              <p class="eyebrow">Today's expected arrivals</p>
              @if (!loadingArrivals()) {
                <span class="count-pill">{{ arrivals().length }}</span>
              }
            </div>

            <!-- Skeleton while loading -->
            @if (loadingArrivals()) {
              <div class="space-y-2">
                @for (i of [0, 1, 2]; track i) {
                  <div class="skeleton" style="height: 68px"></div>
                }
              </div>
            }

            <!-- Empty state -->
            @else if (arrivals().length === 0) {
              <div class="flex flex-col items-center py-10 gap-2" style="color: var(--fg-3)">
                <mat-icon style="font-size: 36px; width: 36px; height: 36px; opacity: 0.4">check_circle</mat-icon>
                <p class="text-sm">No arrivals scheduled for today.</p>
              </div>
            }

            <!-- Arrivals list -->
            @else {
              <div class="space-y-2">
                @for (b of arrivals(); track b.id) {
                  <button type="button" class="booking-card" (click)="selectBooking(b)">
                    <div class="avatar">{{ initials(b.guestName) }}</div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-sm truncate" style="color: var(--fg)">{{ b.guestName }}</p>
                      <p class="text-xs mt-0.5 truncate" style="color: var(--fg-2)">
                        {{ b.hotelName }}
                        @if (b.rooms.length) { &nbsp;·&nbsp; Rooms {{ b.rooms.map(r => r.roomNumber).join(', ') }} }
                      </p>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1">
                      <p class="text-xs" style="color: var(--fg-3)">{{ b.checkInDate | date:'mediumDate' }}</p>
                      <span class="guest-pill">{{ b.guestCount }} guest{{ b.guestCount !== 1 ? 's' : '' }}</span>
                    </div>
                  </button>
                }
              </div>
            }

            <!-- Manual lookup accordion -->
            <details class="rounded-lg" style="border: 1px solid var(--border)">
              <summary class="manual-summary">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px; opacity: 0.6">search</mat-icon>
                Manual lookup by booking ID
              </summary>
              <div class="px-4 pb-4 pt-1">
                <form [formGroup]="manualIdForm" class="flex items-start gap-3">
                  <mat-form-field appearance="outline" class="flex-1 max-w-xs">
                    <mat-label>Booking ID</mat-label>
                    <input matInput type="number" formControlName="bookingId" />
                  </mat-form-field>
                  <button mat-flat-button type="button"
                          [disabled]="manualIdForm.invalid || loadingManual()"
                          style="background: var(--sand-900); color: var(--sand-50); margin-top: 4px"
                          (click)="loadManual()">
                    {{ loadingManual() ? 'Loading…' : 'Load' }}
                  </button>
                </form>
              </div>
            </details>

          </div>
        </mat-step>

        <!-- ── Step 2: Verify identity ─────────────────────────────────── -->
        <mat-step [stepControl]="verifyForm" label="Verify identity" [editable]="!submitting()">
          <div class="py-5 space-y-5">

            @if (booking(); as b) {
              <div class="info-grid">
                <div>
                  <p class="info-label">Guest</p>
                  <p class="info-value">{{ b.guestName }}</p>
                </div>
                <div>
                  <p class="info-label">Hotel</p>
                  <p class="info-value">{{ b.hotelName }}</p>
                </div>
                <div>
                  <p class="info-label">Check-in</p>
                  <p class="info-value">{{ b.checkInDate | date:'mediumDate' }}</p>
                </div>
                <div>
                  <p class="info-label">Check-out</p>
                  <p class="info-value">{{ b.checkOutDate | date:'mediumDate' }}</p>
                </div>
                <div>
                  <p class="info-label">Guests</p>
                  <p class="info-value">{{ b.guestCount }}</p>
                </div>
                <div>
                  <p class="info-label">Rooms</p>
                  <p class="info-value">{{ b.rooms.length ? b.rooms.map(r => r.roomNumber).join(', ') : 'TBD' }}</p>
                </div>
              </div>
            }

            <form [formGroup]="verifyForm" class="space-y-3">
              <mat-form-field appearance="outline" class="w-full max-w-sm">
                <mat-label>ID document reference</mat-label>
                <input matInput formControlName="idRef" placeholder="e.g. Passport AB123456" />
              </mat-form-field>
              <mat-checkbox formControlName="verified">Identity confirmed — documents match</mat-checkbox>
            </form>

            <div class="flex items-center justify-between pt-1">
              <button mat-button matStepperPrevious type="button">Back</button>
              <button mat-flat-button matStepperNext type="button" [disabled]="verifyForm.invalid"
                      style="background: var(--sand-900); color: var(--sand-50)">
                Continue
              </button>
            </div>

          </div>
        </mat-step>

        <!-- ── Step 3: Room & keys ─────────────────────────────────────── -->
        <mat-step label="Room & keys">
          <div class="py-5 space-y-5">

            @if (booking(); as b) {
              <div>
                <p class="eyebrow mb-3">Assigned rooms</p>
                @if (b.rooms.length) {
                  <div class="flex flex-wrap gap-2">
                    @for (room of b.rooms; track room.id) {
                      <span class="room-chip">{{ room.roomNumber }}</span>
                    }
                  </div>
                } @else {
                  <p class="text-sm" style="color: var(--fg-3)">No rooms assigned yet.</p>
                }
              </div>

              <div class="rounded-lg px-4 py-3 text-sm" style="background: var(--surface-2); border: 1px solid var(--border)">
                <p style="color: var(--fg-2)">
                  Check-in date:
                  <span class="font-medium" style="color: var(--fg)">{{ b.checkInDate | date:'fullDate' }}</span>
                </p>
              </div>
            }

            <mat-checkbox [checked]="keyReady()" (change)="keyReady.set($event.checked)">
              Key cards encoded and handed to guest
            </mat-checkbox>

            <div class="flex items-center justify-between pt-1">
              <button mat-button matStepperPrevious type="button">Back</button>
              <button mat-flat-button type="button"
                      [disabled]="submitting() || !keyReady()"
                      (click)="submit()"
                      style="background: var(--sand-900); color: var(--sand-50)">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 6px; vertical-align: middle">how_to_reg</mat-icon>
                {{ submitting() ? 'Processing…' : 'Complete check-in' }}
              </button>
            </div>

          </div>
        </mat-step>

      </mat-stepper>
    </div>
  `,
})
export class CheckInFlowComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private readonly fb          = inject(FormBuilder);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly checkInApi  = inject(CheckInApiService);
  private readonly notify      = inject(NotificationService);

  readonly arrivals        = signal<BookingDto[]>([]);
  readonly loadingArrivals = signal(true);
  readonly loadingManual   = signal(false);
  readonly booking         = signal<BookingDto | null>(null);
  readonly keyReady        = signal(false);
  readonly submitting      = signal(false);

  readonly manualIdForm = this.fb.nonNullable.group({
    bookingId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly verifyForm = this.fb.nonNullable.group({
    idRef:    ['', Validators.required],
    verified: [false, Validators.requiredTrue],
  });

  ngOnInit(): void {
    this.checkInApi.getArrivals().subscribe({
      next:  (list) => { this.arrivals.set(list); this.loadingArrivals.set(false); },
      error: ()     => { this.loadingArrivals.set(false); },
    });
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  selectBooking(b: BookingDto): void {
    this.booking.set(b);
    this.manualIdForm.controls.bookingId.setValue(b.id);
    this.stepper.next();
  }

  loadManual(): void {
    if (this.manualIdForm.invalid) return;
    const id = this.manualIdForm.controls.bookingId.value;
    this.loadingManual.set(true);
    this.bookingsApi.getById(id).subscribe({
      next: (b) => {
        this.loadingManual.set(false);
        this.booking.set(b);
        this.stepper.next();
      },
      error: () => {
        this.loadingManual.set(false);
        this.notify.error(`Booking #${id} not found.`);
      },
    });
  }

  submit(): void {
    if (!this.keyReady()) {
      this.notify.error('Please confirm key cards are encoded before completing check-in.');
      return;
    }
    const b = this.booking();
    if (!b) return;

    this.submitting.set(true);
    this.checkInApi.checkIn(b.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notify.success(`${b.guestName} checked in successfully.`);
        this.resetFlow();
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.notify.error(err?.error?.message ?? 'Check-in failed. Please try again.');
      },
    });
  }

  private resetFlow(): void {
    this.booking.set(null);
    this.keyReady.set(false);
    this.verifyForm.reset();
    this.manualIdForm.reset({ bookingId: 0 });
    this.stepper.reset();
    this.checkInApi.getArrivals().subscribe({
      next:  (list) => this.arrivals.set(list),
      error: ()     => {},
    });
  }
}
