// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { map } from 'rxjs/operators';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { DateFilterFn, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { AuthService } from '../../../core/auth/auth.service';
import { RoomsApiService } from '../../../core/services/rooms-api.service';
import { AncillaryServicesApiService } from '../../../core/services/ancillary-services-api.service';
import { BookingsApiService } from '../../../core/services/bookings-api.service';
import type { RoomDto } from '../../../core/models/room.models';
import type { AncillaryServiceDto } from '../../../core/models/service.models';
import type { BookingDto } from '../../../core/models/booking.models';
import { AppCardComponent } from '../../../shared/ui/app-card/app-card.component';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { FormatTypePipe } from '../../../shared/pipes/format-type.pipe';
import { RoomImageEditorComponent } from '../../admin/room-image-editor/room-image-editor.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgClass,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    AppCardComponent,
    AppLoaderComponent,
    AppBadgeComponent,
    AppButtonComponent,
    FormatTypePipe,
    RoomImageEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Room hero image -->
    @if (room()?.imageUrl) {
      <div style="width: 100%; height: 320px; overflow: hidden; background: var(--sand-800); position: relative;">
        <img
          [src]="room()!.imageUrl"
          [alt]="room()!.type + ' at ' + room()!.hotelName"
          style="width: 100%; height: 100%; object-fit: cover; object-position: center;"
        />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(14,36,48,0.45) 100%);"></div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 0 24px 24px;">
          <p style="font-family: var(--font-display); font-size: clamp(20px,3vw,32px); font-weight: 300; color: #FAF7F2; margin: 0; letter-spacing: var(--ls-tight);">{{ room()!.type }}</p>
          <p style="font-size: var(--fs-sm); color: rgba(250,247,242,0.75); margin: 4px 0 0;">{{ room()!.hotelName }}</p>
        </div>
      </div>
    }
    @if (auth.isAuthenticated() && room() && (auth.role() === 'Admin' || auth.canManageMedia())) {
      <div style="max-width: 560px; margin: 0 auto; padding: 0 24px;">
        <app-room-image-editor
          [roomId]="room()!.id"
          [currentImageUrl]="room()?.imageUrl"
          (imageSaved)="onRoomImageSaved($event)"
        />
      </div>
    }
    <div class="mx-auto max-w-6xl px-4 py-12 text-[var(--fg)]">
      @if (loading()) {
        <app-loader />
      } @else if (room()) {
        @let r = room()!;
        <div class="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">
          <!-- ── LEFT: Room info ── -->
          <div class="space-y-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-sm text-[var(--fg-3)]">{{ r.hotelName }}</p>
                <h1 class="text-3xl font-semibold tracking-tight">Room {{ r.roomNumber }}</h1>
                <div class="mt-2 flex flex-wrap gap-2">
                  <app-badge tone="info">{{ r.type | formatType }}</app-badge>
                  <app-badge>{{ r.status }}</app-badge>
                </div>
              </div>
              <a routerLink="/rooms/search" class="inline-block">
                <app-button variant="secondary" type="button">Back to search</app-button>
              </a>
            </div>

            <app-card title="Overview">
              <p class="text-sm leading-relaxed text-[var(--fg-2)]">
                {{ r.description || 'Premium room with curated amenities.' }}
              </p>
              <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="text-[var(--fg-3)]">Capacity</dt>
                  <dd class="font-medium">{{ r.capacity }} guests</dd>
                </div>
                <div>
                  <dt class="text-[var(--fg-3)]">Floor</dt>
                  <dd class="font-medium">{{ r.floorNumber }}</dd>
                </div>
                <div>
                  <dt class="text-[var(--fg-3)]">Off-peak from</dt>
                  <dd class="font-medium">&#36;{{ r.priceOffPeak }}</dd>
                </div>
                <div>
                  <dt class="text-[var(--fg-3)]">Peak from</dt>
                  <dd class="font-medium">&#36;{{ r.pricePeak }}</dd>
                </div>
              </dl>
            </app-card>
          </div>

          <!-- ── RIGHT: Booking panel ── -->
          <div class="mt-8 lg:mt-0 lg:sticky lg:top-8">
            <div class="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              @if (!auth.isAuthenticated()) {
                <!-- Unauthenticated -->
                <p class="text-base font-semibold text-[var(--fg)]">Ready to book?</p>
                <p class="mt-1 text-sm text-[var(--fg-3)]">Sign in to start your reservation.</p>
                <a
                  [routerLink]="['/login']"
                  [queryParams]="{ returnUrl: '/rooms/' + r.id }"
                  class="mt-4 block"
                >
                  <app-button variant="primary" type="button">Sign in to book</app-button>
                </a>
              } @else if (auth.role() !== 'Guest') {
                <!-- Staff / admin -->
                <div class="flex items-start gap-2 text-sm text-[var(--fg-3)]">
                  <span
                    class="material-icons-outlined mt-0.5 text-base text-[var(--clay-400)]"
                    aria-hidden="true"
                    >info</span
                  >
                  Reservations are available to registered guests only.
                </div>
              } @else if (bookingSuccess()) {
                <!-- Booking confirmed -->
                @let b = bookingSuccess()!;
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--glass-100)]"
                    >
                      <span
                        class="material-icons-outlined text-xl text-[var(--glass-600)]"
                        aria-hidden="true"
                        >check</span
                      >
                    </div>
                    <div>
                      <p class="font-semibold text-[var(--fg)]">Booking confirmed!</p>
                      <p class="text-xs text-[var(--fg-3)]">Reference #{{ b.id }}</p>
                    </div>
                  </div>
                  <div class="rounded-xl bg-[var(--sand-100)] p-4 text-sm space-y-2">
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Check-in</span><span class="font-medium">{{ b.checkInDate }}</span>
                    </div>
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Check-out</span><span class="font-medium">{{ b.checkOutDate }}</span>
                    </div>
                    <div
                      class="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--fg)]"
                    >
                      <span>Total</span><span>&#36;{{ b.totalAmount }}</span>
                    </div>
                  </div>
                  <a routerLink="/app/bookings" class="block">
                    <app-button variant="secondary" type="button">View my bookings</app-button>
                  </a>
                </div>
              } @else {
                <!-- Booking wizard (Guest) -->

                <!-- Step indicators -->
                <div class="mb-5 flex items-center flex-wrap gap-y-2" role="list" aria-label="Booking steps">
                  @for (s of [1, 2, 3]; track s) {
                    <div class="flex items-center" role="listitem">
                      <div
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors"
                        [ngClass]="
                          step() >= s ? 'bg-[var(--fg)] text-white' : 'bg-[var(--sand-100)] text-[var(--fg-3)]'
                        "
                        [attr.aria-current]="step() === s ? 'step' : null"
                      >
                        {{ s }}
                      </div>
                      <span class="ml-1 hidden text-xs text-[var(--fg-3)] sm:inline" style="white-space: nowrap;">
                        @if (s === 1) {
                          Dates
                        } @else if (s === 2) {
                          Add-ons
                        } @else {
                          Review
                        }
                      </span>
                      @if (s < 3) {
                        <div class="mx-2 h-px w-5 shrink-0 bg-[var(--sand-200)]"></div>
                      }
                    </div>
                  }
                </div>

                <!-- ── Step 1: Dates ── -->
                @if (step() === 1) {
                  <p class="mb-3 text-sm font-semibold text-[var(--fg-2)]">Select your dates</p>

                  @if (availabilityLoading()) {
                    <p class="mb-2 text-xs text-[var(--fg-3)]">Loading availability…</p>
                  }

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Stay dates</mat-label>
                    <mat-date-range-input
                      [rangePicker]="picker"
                      [dateFilter]="dateFilter"
                      [min]="minDate"
                      [formGroup]="dateRange"
                    >
                      <input
                        matStartDate
                        formControlName="start"
                        placeholder="Check-in"
                        aria-label="Check-in date"
                      />
                      <input
                        matEndDate
                        formControlName="end"
                        placeholder="Check-out"
                        aria-label="Check-out date"
                      />
                    </mat-date-range-input>
                    <mat-datepicker-toggle matIconSuffix [for]="picker" />
                    <mat-date-range-picker #picker [dateClass]="dateClass" />
                  </mat-form-field>

                  <!-- Guest count -->
                  <div class="mt-3">
                    <label class="mb-1 block text-xs font-medium text-[var(--fg-2)]">
                      Guests
                      <span class="font-normal text-[var(--fg-3)]">(max {{ r.capacity }})</span>
                    </label>
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        (click)="guestCount.update(n => Math.max(1, n - 1))"
                        [disabled]="guestCount() <= 1"
                        class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--fg-2)] transition hover:bg-[var(--sand-100)] disabled:opacity-40"
                        aria-label="Decrease guest count"
                      >−</button>
                      <span class="w-6 text-center text-sm font-semibold text-[var(--fg)]">{{ guestCount() }}</span>
                      <button
                        type="button"
                        (click)="guestCount.update(n => Math.min(r.capacity, n + 1))"
                        [disabled]="guestCount() >= r.capacity"
                        class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--fg-2)] transition hover:bg-[var(--sand-100)] disabled:opacity-40"
                        aria-label="Increase guest count"
                      >+</button>
                    </div>
                  </div>

                  <!-- Room availability / selection -->
                  @if (checkIn() && checkOut() && nights() > 0) {
                    <div class="mt-4">
                      @if (availableRoomsLoading()) {
                        <p class="text-xs" style="color: var(--fg-3);">Checking availability…</p>
                      } @else if (availableRooms().length === 0) {
                        <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--r-md); background: var(--clay-100); font-size: var(--fs-xs); color: var(--clay-700);">
                          <span class="material-icons-outlined" style="font-size: 15px;">event_busy</span>
                          This room is not available for the selected dates.
                        </div>
                      } @else {
                        <!-- Current room is available -->
                        <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--r-md); background: var(--glass-100); font-size: var(--fs-xs); color: var(--glass-700); margin-bottom: 10px;">
                          <span class="material-icons-outlined" style="font-size: 15px;">check_circle</span>
                          This room is available for your dates.
                        </div>

                        <!-- Show grid only when there are other rooms to choose from -->
                        @if (availableRooms().length > 1) {
                          <details style="margin-top: 4px;">
                            <summary style="font-size: var(--fs-xs); font-weight: 600; color: var(--brand); cursor: pointer; list-style: none; display: flex; align-items: center; gap: 4px; user-select: none;">
                              <span class="material-icons-outlined" style="font-size: 14px;">swap_horiz</span>
                              Switch to a different room
                            </summary>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; align-items: stretch; margin-top: 10px;">
                              @for (ar of availableRooms(); track ar.id) {
                                <div
                                  role="radio"
                                  [attr.aria-checked]="selectedRoomId() === ar.id"
                                  tabindex="0"
                                  style="border-radius: var(--r-lg); overflow: hidden; cursor: pointer; transition: box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out); display: flex; flex-direction: column;"
                                  [style.border]="selectedRoomId() === ar.id ? '2px solid var(--brand)' : '2px solid var(--border)'"
                                  [style.boxShadow]="selectedRoomId() === ar.id ? 'var(--shadow-md)' : 'none'"
                                  (click)="selectRoom(ar.id)"
                                  (keydown.space)="selectRoom(ar.id)"
                                  (keydown.enter)="selectRoom(ar.id)"
                                >
                                  <div style="height: 110px; overflow: hidden; background: var(--sand-100);">
                                    @if (ar.imageUrl) {
                                      <img [src]="ar.imageUrl" [alt]="ar.type" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                                    } @else {
                                      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                        <span class="material-icons-outlined" style="font-size: 32px; color: var(--sand-300);">bed</span>
                                      </div>
                                    }
                                  </div>
                                  <div style="padding: 10px 12px 12px; background: var(--surface); flex: 1; display: flex; flex-direction: column;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                      <span style="font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 400; color: var(--fg);">{{ ar.type }}</span>
                                      <span style="font-family: var(--font-display); font-size: var(--fs-base); font-weight: 400; color: var(--fg); font-variant-numeric: tabular-nums;">&#36;{{ ar.priceOffPeak }}<span style="font-family: var(--font-sans); font-size: 10px; color: var(--fg-3);">/night</span></span>
                                    </div>
                                    <span style="font-size: 11px; color: var(--fg-3); display: flex; align-items: center; gap: 4px;">
                                      <span class="material-icons-outlined" style="font-size: 12px;">person</span>
                                      Up to {{ ar.capacity }} guests
                                    </span>
                                    @if (selectedRoomId() === ar.id) {
                                      <div style="margin-top: 6px; display: flex; align-items: center; gap: 4px; color: var(--brand); font-size: 11px; font-weight: 600;">
                                        <span class="material-icons-outlined" style="font-size: 14px;">check_circle</span>
                                        Selected
                                      </div>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </details>
                        }
                      }
                    </div>
                  }

                  @if (nights() > 0 && selectedRoomId()) {
                    <div class="mt-3 rounded-xl bg-[var(--sand-100)] px-3 py-2.5 text-sm">
                      <div class="flex justify-between text-[var(--fg-2)]">
                        <span
                          >&#36;{{ selectedRoomPrice() }} × {{ nights() }} night{{
                            nights() === 1 ? '' : 's'
                          }}</span
                        >
                        <span class="font-semibold text-[var(--fg)]">&#36;{{ roomTotal() }}</span>
                      </div>
                    </div>
                  }

                  @if (dateRangeError()) {
                    <p class="mt-2 text-xs text-[var(--clay-500)]" role="alert">{{ dateRangeError() }}</p>
                  }

                  <button
                    type="button"
                    (click)="goToStep2()"
                    [disabled]="!checkIn() || !checkOut() || !selectedRoomId()"
                    class="mt-4 w-full rounded-xl bg-[var(--fg)] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--sand-800)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                }

                <!-- ── Step 2: Add-ons ── -->
                @if (step() === 2) {
                  <p class="mb-3 text-sm font-semibold text-[var(--fg-2)]">
                    Add-on services <span class="font-normal text-[var(--fg-3)]">(optional)</span>
                  </p>

                  @if (services().length === 0) {
                    <p class="text-sm text-[var(--fg-3)]">No add-on services available.</p>
                  } @else {
                    <div class="space-y-2">
                      @for (svc of services(); track svc.id) {
                        <div
                          class="flex items-start justify-between rounded-xl border border-[var(--border)] bg-[var(--sand-100)] p-3"
                        >
                          <div class="min-w-0 flex-1 pr-3">
                            <p class="text-sm font-medium text-[var(--fg)]">{{ svc.name }}</p>
                            <p class="mt-0.5 text-xs text-[var(--fg-3)]">
                              &#36;{{ svc.fee }} / {{ svc.unit }}
                            </p>
                          </div>
                          <div class="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              (click)="setServiceQty(svc.id, getServiceQty(svc.id) - 1)"
                              [disabled]="getServiceQty(svc.id) === 0"
                              class="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-sm text-[var(--fg-2)] transition hover:bg-[var(--sand-100)] disabled:opacity-40"
                              [attr.aria-label]="'Decrease ' + svc.name"
                            >
                              −
                            </button>
                            <span
                              class="w-5 text-center text-sm font-semibold text-[var(--fg)]"
                              [attr.aria-label]="svc.name + ' quantity'"
                              >{{ getServiceQty(svc.id) }}</span
                            >
                            <button
                              type="button"
                              (click)="setServiceQty(svc.id, getServiceQty(svc.id) + 1)"
                              class="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-sm text-[var(--fg-2)] transition hover:bg-[var(--sand-100)]"
                              [attr.aria-label]="'Increase ' + svc.name"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <div class="mt-4 flex gap-2">
                    <button
                      type="button"
                      (click)="back()"
                      class="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--fg-2)] transition hover:bg-[var(--sand-100)]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="goToStep3()"
                      class="flex-1 rounded-xl bg-[var(--fg)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--sand-800)] active:scale-[0.98]"
                    >
                      Continue
                    </button>
                  </div>
                }

                <!-- ── Step 3: Review & Confirm ── -->
                @if (step() === 3) {
                  <p class="mb-3 text-sm font-semibold text-[var(--fg-2)]">Review your booking</p>

                  <div class="rounded-xl bg-[var(--sand-100)] p-4 text-sm space-y-2">
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Room</span>
                      <span class="font-medium">{{ selectedRoom()?.roomNumber ?? r.roomNumber }} · {{ (selectedRoom()?.type ?? r.type) | formatType }}</span>
                    </div>
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Guests</span>
                      <span class="font-medium">{{ guestCount() }}</span>
                    </div>
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Check-in</span>
                      <span class="font-medium">{{ formatDateDisplay(checkIn()) }}</span>
                    </div>
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>Check-out</span>
                      <span class="font-medium">{{ formatDateDisplay(checkOut()) }}</span>
                    </div>
                    <div class="flex justify-between text-[var(--fg-2)]">
                      <span>{{ nights() }} night{{ nights() === 1 ? '' : 's' }}</span>
                      <span class="font-medium">&#36;{{ roomTotal() }}</span>
                    </div>
                    @if (servicesTotal() > 0) {
                      <div class="flex justify-between text-[var(--fg-2)]">
                        <span>Add-ons</span>
                        <span class="font-medium">&#36;{{ servicesTotal() }}</span>
                      </div>
                    }
                    <div
                      class="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--fg)]"
                    >
                      <span>Total</span>
                      <span>&#36;{{ grandTotal() }}</span>
                    </div>
                  </div>

                  @if (submitError()) {
                    <p class="mt-2 text-xs text-[var(--clay-500)]" role="alert">{{ submitError() }}</p>
                  }

                  <div class="mt-4 flex gap-2">
                    <button
                      type="button"
                      (click)="back()"
                      [disabled]="submitting()"
                      class="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--fg-2)] transition hover:bg-[var(--sand-100)] disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="confirm()"
                      [disabled]="submitting()"
                      class="flex-1 rounded-xl bg-[var(--fg)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--sand-800)] active:scale-[0.98] disabled:opacity-50"
                    >
                      @if (submitting()) {
                        Booking…
                      } @else {
                        Confirm booking
                      }
                    </button>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RoomDetailComponent {
  protected readonly Math = Math;
  private readonly route = inject(ActivatedRoute);
  private readonly roomsApi = inject(RoomsApiService);
  private readonly ancillaryApi = inject(AncillaryServicesApiService);
  private readonly bookingsApi = inject(BookingsApiService);
  readonly auth = inject(AuthService);

  // Room data
  readonly room = signal<RoomDto | null>(null);
  readonly loading = signal(true);

  // Availability
  readonly unavailableDates = signal<{ from: string; to: string }[]>([]);
  readonly availabilityLoading = signal(false);

  // Available rooms for the selected dates
  readonly availableRooms = signal<RoomDto[]>([]);
  readonly availableRoomsLoading = signal(false);
  readonly selectedRoomId = signal<number | null>(null);

  // Booking wizard
  readonly step = signal<1 | 2 | 3>(1);
  readonly dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  readonly checkIn = signal<Date | null>(null);
  readonly checkOut = signal<Date | null>(null);
  readonly minDate = new Date();

  // Guest count
  readonly guestCount = signal(1);

  // Services
  readonly services = signal<AncillaryServiceDto[]>([]);
  readonly serviceQty = signal<Map<number, number>>(new Map());

  // Submission
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly bookingSuccess = signal<BookingDto | null>(null);
  readonly dateRangeError = signal<string | null>(null);

  // Computed
  readonly nights = computed(() => {
    const s = this.checkIn();
    const e = this.checkOut();
    if (!s || !e) return 0;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
  });

  readonly selectedRoom = computed(() => {
    const id = this.selectedRoomId();
    if (id == null) return this.room();
    return this.availableRooms().find((r) => r.id === id) ?? this.room();
  });

  readonly selectedRoomPrice = computed(() => this.selectedRoom()?.priceOffPeak ?? 0);

  readonly roomTotal = computed(() => {
    const price = this.selectedRoomPrice();
    const n = this.nights();
    return price && n ? price * n : 0;
  });

  readonly servicesTotal = computed(() => {
    let total = 0;
    for (const [id, qty] of this.serviceQty()) {
      const svc = this.services().find((s) => s.id === id);
      if (svc && qty > 0) total += svc.fee * qty;
    }
    return total;
  });

  readonly grandTotal = computed(() => this.roomTotal() + this.servicesTotal());

  readonly dateFilter: DateFilterFn<Date | null> = (d: Date | null) => {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return false;
    const ymd = this.toYmd(d);
    return !this.unavailableDates().some((r) => ymd >= r.from && ymd < r.to);
  };

  readonly dateClass: MatCalendarCellClassFunction<Date> = (d) => {
    const ymd = this.toYmd(d);
    return this.unavailableDates().some((r) => ymd >= r.from && ymd < r.to)
      ? 'cal-unavailable'
      : '';
  };

  constructor() {
    this.dateRange.controls.start.valueChanges.subscribe((v) => {
      this.checkIn.set(v);
      this.dateRangeError.set(null);
      this.availableRooms.set([]);
      this.selectedRoomId.set(null);
    });
    this.dateRange.controls.end.valueChanges.subscribe((v) => {
      this.checkOut.set(v);
      this.dateRangeError.set(null);
      const ci = this.checkIn();
      const co = v;
      const r = this.room();
      if (ci && co && co > ci && r) {
        this.availableRoomsLoading.set(true);
        this.roomsApi
          .searchAvailable({
            hotelId: r.hotelId,
            checkIn: this.toYmd(ci),
            checkOut: this.toYmd(co),
          })
          .subscribe({
            next: (rooms) => {
              this.availableRooms.set(rooms);
              // Pre-select the current room if it is available
              const preselect = rooms.find((rm) => rm.id === r.id) ?? rooms[0];
              this.selectedRoomId.set(preselect?.id ?? null);
              this.availableRoomsLoading.set(false);
            },
            error: () => {
              this.availableRooms.set([]);
              this.availableRoomsLoading.set(false);
            },
          });
      }
    });

    this.route.paramMap.pipe(map((p) => Number(p.get('id')))).subscribe((id) => {
      if (!Number.isFinite(id)) {
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.roomsApi.getById(id).subscribe({
        next: (r) => {
          this.room.set(r);
          this.loading.set(false);
        },
        error: () => {
          this.room.set(null);
          this.loading.set(false);
        },
      });

      this.availabilityLoading.set(true);
      this.roomsApi.getUnavailableDates(id).subscribe({
        next: (dates) => {
          this.unavailableDates.set(dates);
          this.availabilityLoading.set(false);
        },
        error: () => this.availabilityLoading.set(false),
      });
    });

    this.ancillaryApi.getAll().subscribe({
      next: (s) => this.services.set(s),
      error: () => this.services.set([]),
    });

    const qp = this.route.snapshot.queryParamMap;
    const ciStr = qp.get('checkIn');
    const coStr = qp.get('checkOut');
    if (ciStr && coStr) {
      const ci = this.parseYmd(ciStr);
      const co = this.parseYmd(coStr);
      if (ci && co && co > ci) {
        this.dateRange.setValue({ start: ci, end: co });
      }
    }
  }

  goToStep2(): void {
    const ci = this.checkIn();
    const co = this.checkOut();
    if (!ci || !co) {
      this.dateRangeError.set('Please select your check-in and check-out dates.');
      return;
    }
    if (co <= ci) {
      this.dateRangeError.set('Check-out must be after check-in.');
      return;
    }
    const sYmd = this.toYmd(ci);
    const eYmd = this.toYmd(co);
    const overlaps = this.unavailableDates().some((r) => sYmd < r.to && eYmd > r.from);
    if (overlaps) {
      this.dateRangeError.set(
        'Your selected dates overlap with an existing booking. Please choose different dates.',
      );
      return;
    }
    if (!this.selectedRoomId()) {
      this.dateRangeError.set('Please select a room before continuing.');
      return;
    }
    this.dateRangeError.set(null);
    this.step.set(2);
  }

  goToStep3(): void {
    this.step.set(3);
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1) as 1 | 2 | 3);
  }

  setServiceQty(serviceId: number, qty: number): void {
    this.serviceQty.update((m) => {
      const next = new Map(m);
      if (qty <= 0) next.delete(serviceId);
      else next.set(serviceId, qty);
      return next;
    });
  }

  getServiceQty(serviceId: number): number {
    return this.serviceQty().get(serviceId) ?? 0;
  }

  selectRoom(id: number): void {
    this.selectedRoomId.set(id);
  }

  confirm(): void {
    const r = this.room();
    const ci = this.checkIn();
    const co = this.checkOut();
    const uid = this.auth.userId();
    const roomId = this.selectedRoomId() ?? r?.id;
    if (!r || !ci || !co || !uid || !roomId) return;

    const services: { serviceId: number; quantity: number; serviceDate: string }[] = [];
    for (const [id, qty] of this.serviceQty()) {
      if (qty > 0) services.push({ serviceId: id, quantity: qty, serviceDate: this.toYmd(ci) });
    }

    this.submitting.set(true);
    this.submitError.set(null);
    this.bookingsApi
      .create(uid, {
        hotelId: r.hotelId,
        checkInDate: this.toYmd(ci),
        checkOutDate: this.toYmd(co),
        roomIds: [roomId],
        services,
        notes: '',
        guestCount: this.guestCount(),
      })
      .subscribe({
        next: (booking) => {
          this.bookingSuccess.set(booking);
          this.submitting.set(false);
        },
        error: (err: { error?: { message?: string } }) => {
          this.submitError.set(err?.error?.message ?? 'Booking failed. Please try again.');
          this.submitting.set(false);
        },
      });
  }

  formatDateDisplay(d: Date | null): string {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private parseYmd(s: string): Date | null {
    const parts = s.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [y, m, d] = parts as [number, number, number];
    return new Date(y, m - 1, d);
  }

  private toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onRoomImageSaved(newUrl: string | null): void {
    this.room.update(r => r ? { ...r, imageUrl: newUrl ?? undefined } : r);
  }
}
