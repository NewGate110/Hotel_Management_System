// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import { CheckInApiService } from '../../../core/services/checkin-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { BookingDto } from '../../../core/models/booking.models';
import type { InvoiceDto } from '../../../core/models/invoice.models';

@Component({
  selector: 'app-check-out-flow',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DecimalPipe,
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
      background: var(--clay-100); color: var(--clay-600);
    }
    .overdue-pill {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: var(--r-pill);
      font-size: 11px; font-weight: 500;
      background: var(--clay-50); color: var(--clay-600);
    }
    .on-time-pill {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: var(--r-pill);
      font-size: 11px; font-weight: 500;
      background: var(--bg-alt); color: var(--fg-3);
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
    .invoice-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 16px; font-size: var(--fs-sm); color: var(--fg-2);
      border-bottom: 1px solid var(--border);
    }
    .invoice-row:last-child { border-bottom: none; }
    .invoice-total {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; background: var(--surface-2);
    }
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
        <h2 style="color: var(--fg)">Check-out</h2>
      </div>

      <mat-stepper #stepper linear>

        <!-- ── Step 1: Select guest ────────────────────────────────────── -->
        <mat-step [completed]="!!booking()" label="Select guest" [editable]="!submitting()">
          <div class="py-5 space-y-4">

            <div class="flex items-center gap-2">
              <p class="eyebrow">Currently checked in</p>
              @if (!loadingGuests()) {
                <span class="count-pill">{{ checkedInGuests().length }}</span>
              }
            </div>

            <!-- Skeleton -->
            @if (loadingGuests()) {
              <div class="space-y-2">
                @for (i of [0, 1, 2]; track i) {
                  <div class="skeleton" style="height: 68px"></div>
                }
              </div>
            }

            <!-- Empty state -->
            @else if (checkedInGuests().length === 0) {
              <div class="flex flex-col items-center py-10 gap-2" style="color: var(--fg-3)">
                <mat-icon style="font-size: 36px; width: 36px; height: 36px; opacity: 0.4">hotel</mat-icon>
                <p class="text-sm">No guests currently checked in.</p>
              </div>
            }

            <!-- Guest list -->
            @else {
              <div class="space-y-2">
                @for (b of checkedInGuests(); track b.id) {
                  <button type="button" class="booking-card" (click)="selectGuest(b)">
                    <div class="avatar">{{ initials(b.guestName) }}</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-sm truncate" style="color: var(--fg)">{{ b.guestName }}</p>
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--fg-3);">#{{ b.id }}</span>
                      </div>
                      <p class="text-xs mt-0.5 truncate" style="color: var(--fg-2)">
                        {{ b.hotelName }}
                        @if (b.rooms.length) { &nbsp;·&nbsp; Rooms {{ b.rooms.map(r => r.roomNumber).join(', ') }} }
                      </p>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1">
                      <span [class]="isOverdue(b.checkOutDate) ? 'overdue-pill' : 'on-time-pill'">
                        Due {{ b.checkOutDate | date:'mediumDate' }}
                      </span>
                      <p class="text-xs font-semibold" style="font-family: var(--font-display); color: var(--fg)">
                        \${{ b.totalAmount | number:'1.2-2' }}
                      </p>
                    </div>
                  </button>
                }
              </div>
            }

            <!-- Manual lookup -->
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

        <!-- ── Step 2: Invoice review ──────────────────────────────────── -->
        <mat-step label="Invoice" [editable]="!submitting()">
          <div class="py-5 space-y-5">

            @if (booking(); as b) {
              <div class="info-grid">
                <div>
                  <p class="info-label">Guest</p>
                  <p class="info-value">{{ b.guestName }}</p>
                </div>
                <div>
                  <p class="info-label">Rooms</p>
                  <p class="info-value">{{ b.rooms.length ? b.rooms.map(r => r.roomNumber).join(', ') : '—' }}</p>
                </div>
                <div>
                  <p class="info-label">Check-in</p>
                  <p class="info-value">{{ b.checkInDate | date:'mediumDate' }}</p>
                </div>
                <div>
                  <p class="info-label">Check-out</p>
                  <p class="info-value">{{ b.checkOutDate | date:'mediumDate' }}</p>
                </div>
              </div>
            }

            @if (invoice(); as inv) {
              <div>
                <p class="eyebrow mb-3">Invoice breakdown</p>
                <div class="rounded-lg overflow-hidden" style="border: 1px solid var(--border)">
                  @for (line of inv.lineItems; track line.id; let odd = $odd) {
                    <div class="invoice-row" [style.background]="odd ? 'var(--surface-2)' : 'var(--surface)'">
                      <span>{{ line.description }}</span>
                      <span class="font-medium" style="color: var(--fg)">\${{ line.lineTotal | number:'1.2-2' }}</span>
                    </div>
                  }
                  <div class="invoice-total">
                    <span class="text-sm font-semibold" style="color: var(--fg)">Total due</span>
                    <span style="font-family: var(--font-display); font-size: var(--fs-xl); color: var(--fg)">
                      \${{ inv.totalAmount | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>
            } @else {
              <p class="text-sm" style="color: var(--fg-3)">
                No invoice on file yet — it will be generated on check-out.
              </p>
            }

            <div class="flex justify-between pt-1">
              <button mat-button matStepperPrevious type="button">Back</button>
              <button mat-flat-button matStepperNext type="button"
                      style="background: var(--sand-900); color: var(--sand-50)">
                Proceed to payment
              </button>
            </div>

          </div>
        </mat-step>

        <!-- ── Step 3: Settle ─────────────────────────────────────────── -->
        <mat-step label="Settle">
          <div class="py-5 space-y-5">

            <p class="text-sm" style="color: var(--fg-2)">
              Confirm payment has been collected and the guest's key cards have been returned.
              The room will be marked available for housekeeping.
            </p>

            @if (booking(); as b) {
              <div class="rounded-lg overflow-hidden" style="border: 1px solid var(--border)">
                <div class="px-5 py-4">
                  <p class="info-label mb-1">Amount due</p>
                  <p style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: 300; color: var(--fg); line-height: 1">
                    \${{ b.totalAmount | number:'1.2-2' }}
                  </p>
                </div>
                <div class="px-5 py-3 text-sm" style="background: var(--surface-2); border-top: 1px solid var(--border); color: var(--fg-2)">
                  {{ b.guestName }} &nbsp;·&nbsp; {{ b.rooms.length ? b.rooms.map(r => r.roomNumber).join(', ') : 'No room' }}
                </div>
              </div>
            }

            <div class="flex justify-between">
              <button mat-button matStepperPrevious type="button">Back</button>
              <button mat-flat-button type="button"
                      [disabled]="submitting()"
                      (click)="checkout()"
                      style="background: var(--sand-900); color: var(--sand-50)">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px; margin-right: 6px; vertical-align: middle">logout</mat-icon>
                {{ submitting() ? 'Processing…' : 'Complete check-out' }}
              </button>
            </div>

          </div>
        </mat-step>

      </mat-stepper>
    </div>
  `,
})
export class CheckOutFlowComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private readonly fb          = inject(FormBuilder);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly checkInApi  = inject(CheckInApiService);
  private readonly notify      = inject(NotificationService);

  readonly checkedInGuests = signal<BookingDto[]>([]);
  readonly loadingGuests   = signal(true);
  readonly loadingManual   = signal(false);
  readonly booking         = signal<BookingDto | null>(null);
  readonly invoice         = signal<InvoiceDto | null>(null);
  readonly submitting      = signal(false);

  readonly manualIdForm = this.fb.nonNullable.group({
    bookingId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.checkInApi.getDepartures().subscribe({
      next:  (list) => { this.checkedInGuests.set(list); this.loadingGuests.set(false); },
      error: ()     => { this.loadingGuests.set(false); },
    });
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  isOverdue(checkOutDate: string): boolean {
    return new Date(checkOutDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  }

  selectGuest(b: BookingDto): void {
    this.booking.set(b);
    this.manualIdForm.controls.bookingId.setValue(b.id);
    this.bookingsApi.getInvoice(b.id).subscribe({
      next:  (inv) => this.invoice.set(inv),
      error: ()    => this.invoice.set(null),
    });
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
        this.bookingsApi.getInvoice(id).subscribe({
          next:  (inv) => this.invoice.set(inv),
          error: ()    => this.invoice.set(null),
        });
        this.stepper.next();
      },
      error: () => {
        this.loadingManual.set(false);
        this.notify.error(`Booking #${id} not found.`);
      },
    });
  }

  checkout(): void {
    const b = this.booking();
    if (!b) return;

    this.submitting.set(true);
    this.checkInApi.checkOut(b.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notify.success(`${b.guestName} checked out. Invoice finalised.`);
        this.resetFlow();
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.notify.error(err?.error?.message ?? 'Check-out failed. Please try again.');
      },
    });
  }

  private resetFlow(): void {
    this.booking.set(null);
    this.invoice.set(null);
    this.manualIdForm.reset({ bookingId: 0 });
    this.stepper.reset();
    this.checkInApi.getDepartures().subscribe({
      next:  (list) => this.checkedInGuests.set(list),
      error: ()     => {},
    });
  }
}
