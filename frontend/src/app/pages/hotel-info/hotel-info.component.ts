// Author: S2401265 Ahmed Aslan Ibrahim
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HotelsApiService } from '../../core/services/hotels-api.service';
import { AppLoaderComponent } from '../../shared/ui/app-loader/app-loader.component';
import { AppEmptyStateComponent } from '../../shared/ui/app-empty-state/app-empty-state.component';
import type { HotelSummaryDto } from '../../core/models/hotel.models';

@Component({
  selector: 'app-hotel-info',
  standalone: true,
  imports: [AppLoaderComponent, AppEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page header -->
    <div style="max-width: var(--container); margin: 0 auto; padding: 80px 24px 0;">
      <p class="eyebrow">Grand Plaza Hotel Group</p>
      <h1 style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 16px;">Our Properties</h1>
      <p style="font-size: var(--fs-sm); color: var(--fg-2); max-width: 540px; line-height: var(--lh-relaxed); margin: 0 0 48px;">
        Seven distinct properties across the Maldives — each offering a unique expression of island hospitality, from intimate coral-reef inns to award-winning luxury hotels.
      </p>
    </div>

    @if (loading()) {
      <div style="max-width: var(--container); margin: 0 auto; padding: 0 24px 80px;">
        <app-loader caption="Loading properties…" />
      </div>
    } @else if (error()) {
      <div style="max-width: var(--container); margin: 0 auto; padding: 0 24px 80px;">
        <app-empty-state icon="error_outline" title="Could not load hotels" [hint]="error()!" />
      </div>
    } @else {
      <div style="max-width: var(--container); margin: 0 auto; padding: 0 24px 96px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; align-items: stretch;">
          @for (hotel of hotels(); track hotel.id) {
            <article
              style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-sm); cursor: pointer; transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out); display: flex; flex-direction: column;"
              (click)="viewHotel(hotel.id)"
              (mouseenter)="$any($event.currentTarget).style.boxShadow='var(--shadow-md)'; $any($event.currentTarget).style.transform='translateY(-2px)'"
              (mouseleave)="$any($event.currentTarget).style.boxShadow='var(--shadow-sm)'; $any($event.currentTarget).style.transform='translateY(0)'"
            >
              <!-- Hero image -->
              <div style="height: 200px; overflow: hidden; background: var(--sand-200); position: relative;">
                @if (hotel.imageUrl) {
                  <img
                    [src]="hotel.imageUrl"
                    [alt]="hotel.name"
                    style="width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform var(--dur-glide) var(--ease-glide);"
                    loading="lazy"
                  />
                } @else {
                  <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--sand-100);">
                    <span class="material-icons-outlined" style="font-size: 48px; color: var(--sand-400);">hotel</span>
                  </div>
                }
              </div>

              <!-- Card body -->
              <div style="padding: 20px 22px 22px; flex: 1; display: flex; flex-direction: column;">
                <h2 style="font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 400; color: var(--fg); margin: 0 0 6px; letter-spacing: var(--ls-tight); line-height: 1.25;">
                  {{ hotel.name }}
                </h2>
                <p style="display: flex; align-items: center; gap: 4px; font-size: var(--fs-sm); color: var(--fg-3); margin: 0 0 18px;">
                  <span class="material-icons-outlined" style="font-size: 14px;">location_on</span>
                  {{ hotel.city }}, {{ hotel.country }}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); margin-top: auto;">
                  <span style="font-size: var(--fs-xs); font-weight: 500; color: var(--fg-3); text-transform: uppercase; letter-spacing: 0.1em;">
                    Grand Plaza Collection
                  </span>
                  <button
                    type="button"
                    style="display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-sm); font-weight: 600; color: var(--brand); background: none; border: none; cursor: pointer; padding: 0;"
                  >
                    View rooms
                    <span class="material-icons-outlined" style="font-size: 16px;">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    }
  `,
})
export class HotelInfoComponent {
  private readonly hotelsApi = inject(HotelsApiService);
  private readonly router    = inject(Router);

  readonly hotels  = signal<HotelSummaryDto[]>([]);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);

  constructor() {
    this.hotelsApi.getAll().subscribe({
      next: (rows) => {
        this.hotels.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Please ensure the API is running.');
        this.loading.set(false);
      },
    });
  }

  viewHotel(id: number): void {
    void this.router.navigate(['/hotel', id]);
  }
}
