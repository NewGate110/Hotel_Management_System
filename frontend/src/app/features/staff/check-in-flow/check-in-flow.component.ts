import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-4 text-2xl font-semibold" style="color: var(--fg)">Check-in</h1>
    <mat-stepper linear>
      <mat-step [stepControl]="lookupForm" label="Lookup">
        <form [formGroup]="lookupForm" class="space-y-4 py-4">
          <mat-form-field appearance="outline" class="w-full max-w-sm">
            <mat-label>Booking ID</mat-label>
            <input matInput type="number" formControlName="bookingId" />
          </mat-form-field>
          <div>
            <button mat-flat-button type="button" matStepperNext (click)="loadBooking()"
                    style="background: var(--sand-900); color: var(--sand-50)">
              Load booking
            </button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="verifyForm" label="Verify">
        @if (booking(); as b) {
          <div class="space-y-2 py-4 text-sm" style="color: var(--fg-2)">
            <p><strong>Guest:</strong> {{ b.guestName }}</p>
            <p><strong>Hotel:</strong> {{ b.hotelName }}</p>
            <p><strong>Status:</strong> {{ b.status }}</p>
          </div>
        }
        <form [formGroup]="verifyForm" class="space-y-4">
          <mat-form-field appearance="outline" class="w-full max-w-sm">
            <mat-label>ID reference</mat-label>
            <input matInput formControlName="idRef" />
          </mat-form-field>
          <mat-checkbox formControlName="verified">Identity verified</mat-checkbox>
        </form>
        <div class="flex justify-between">
          <button mat-button matStepperPrevious type="button">Back</button>
          <button mat-flat-button matStepperNext type="button" [disabled]="verifyForm.invalid"
                  style="background: var(--sand-900); color: var(--sand-50)">
            Next
          </button>
        </div>
      </mat-step>
      <mat-step label="Room & keys">
        <div class="py-4 text-sm" style="color: var(--fg-2)">
          @if (booking(); as b) {
            <p><strong>Room{{ b.rooms.length !== 1 ? 's' : '' }}:</strong>
              {{ b.rooms.length ? b.rooms.map(r => r.roomNumber).join(', ') : 'Not yet assigned' }}
            </p>
            <p class="mt-1"><strong>Check-in:</strong> {{ b.checkInDate | date:'mediumDate' }}</p>
          } @else {
            <p>Load a booking in step 1 to see room details.</p>
          }
        </div>
        <mat-checkbox [checked]="keyReady()" (change)="keyReady.set($event.checked)">Key cards encoded</mat-checkbox>
        <div class="mt-6 flex justify-between">
          <button mat-button matStepperPrevious type="button">Back</button>
          <button mat-flat-button type="button" [disabled]="submitting()" (click)="submit()"
                  style="background: var(--sand-900); color: var(--sand-50)">
            Complete check-in
          </button>
        </div>
      </mat-step>
    </mat-stepper>
  `,
})
export class CheckInFlowComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly checkInApi = inject(CheckInApiService);
  private readonly notify = inject(NotificationService);

  readonly booking = signal<BookingDto | null>(null);
  readonly keyReady = signal(false);
  readonly submitting = signal(false);

  readonly lookupForm = this.fb.nonNullable.group({
    bookingId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly verifyForm = this.fb.nonNullable.group({
    idRef: ['', Validators.required],
    verified: [false, Validators.requiredTrue],
  });

  loadBooking(): void {
    if (this.lookupForm.invalid) return;
    const id = this.lookupForm.controls.bookingId.value;
    this.bookingsApi.getById(id).subscribe((b) => this.booking.set(b));
  }

  submit(): void {
    const id = this.lookupForm.controls.bookingId.value;
    this.submitting.set(true);
    this.checkInApi.checkIn(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notify.success('Guest checked in');
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.notify.error(err?.error?.message ?? 'Check-in failed. Please try again.');
      },
    });
  }
}
