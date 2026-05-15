import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotelsApiService } from '../../core/services/hotels-api.service';
import { AppLoaderComponent } from '../../shared/ui/app-loader/app-loader.component';
import { AppEmptyStateComponent } from '../../shared/ui/app-empty-state/app-empty-state.component';
import { RoomImageEditorComponent } from '../../features/admin/room-image-editor/room-image-editor.component';
import { AuthService } from '../../core/auth/auth.service';
import type { HotelDto } from '../../core/models/hotel.models';
import type { RoomDto } from '../../core/models/room.models';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [AppLoaderComponent, AppEmptyStateComponent, RouterLink, RoomImageEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div style="padding: 80px 24px; max-width: var(--container); margin: 0 auto;">
        <app-loader caption="Loading hotel…" />
      </div>
    } @else if (!hotel()) {
      <div style="padding: 80px 24px; max-width: var(--container); margin: 0 auto;">
        <app-empty-state icon="hotel" title="Hotel not found" hint="This property could not be loaded." />
      </div>
    } @else {
      <!-- Hero -->
      <div style="position: relative; height: 420px; background: var(--sand-800); overflow: hidden;">
        @if (hotel()!.imageUrl) {
          <img
            [src]="hotel()!.imageUrl"
            [alt]="hotel()!.name"
            style="width: 100%; height: 100%; object-fit: cover; object-position: center;"
          />
        }
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,36,48,0.15) 0%, rgba(14,36,48,0.65) 100%);"></div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 0 32px 36px; max-width: var(--container); margin: 0 auto;">
          <p class="eyebrow" style="color: rgba(250,247,242,0.75); margin: 0 0 8px;">Grand Plaza Collection</p>
          <h1 style="font-family: var(--font-display); font-size: clamp(28px,5vw,52px); font-weight: 300; letter-spacing: var(--ls-tight); color: #FAF7F2; margin: 0 0 12px; line-height: 1.1;">{{ hotel()!.name }}</h1>
          <p style="display: inline-flex; align-items: center; gap: 5px; font-size: var(--fs-sm); color: rgba(250,247,242,0.8);">
            <span class="material-icons-outlined" style="font-size: 16px;">location_on</span>
            {{ hotel()!.city }}, {{ hotel()!.country }}
          </p>
        </div>
      </div>

      <!-- Info strip + back link -->
      <div style="background: var(--bg); border-bottom: 1px solid var(--border);">
        <div style="max-width: var(--container); margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <a routerLink="/hotel" style="display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-sm); color: var(--fg-2); text-decoration: none;">
            <span class="material-icons-outlined" style="font-size: 16px;">arrow_back</span>
            All properties
          </a>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            @if (hotel()!.phone) {
              <a [href]="'tel:' + hotel()!.phone" style="display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--fg-2); text-decoration: none;">
                <span class="material-icons-outlined" style="font-size: 15px; color: var(--brand);">phone</span>
                {{ hotel()!.phone }}
              </a>
            }
            @if (hotel()!.email) {
              <a [href]="'mailto:' + hotel()!.email" style="display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--fg-2); text-decoration: none;">
                <span class="material-icons-outlined" style="font-size: 15px; color: var(--brand);">email</span>
                {{ hotel()!.email }}
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Rooms section -->
      <div style="max-width: var(--container); margin: 0 auto; padding: 56px 24px 96px;">
        <div style="margin-bottom: 40px;">
          <p class="eyebrow">{{ hotel()!.name }}</p>
          <h2 style="font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 0;">Available rooms</h2>
        </div>

        @if (loadingRooms()) {
          <app-loader caption="Loading rooms…" />
        } @else if (rooms().length === 0) {
          <app-empty-state icon="bed" title="No rooms available" hint="Check back soon for availability." />
        } @else {
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            @for (room of rooms(); track room.id) {
              <article
                style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow var(--dur-base) var(--ease-out);"
                (mouseenter)="$any($event.currentTarget).style.boxShadow='var(--shadow-md)'"
                (mouseleave)="$any($event.currentTarget).style.boxShadow='var(--shadow-sm)'"
              >
                <!-- Room image -->
                <div style="height: 160px; overflow: hidden; background: var(--sand-100); position: relative;">
                  @if (room.imageUrl) {
                    <img
                      [src]="room.imageUrl"
                      [alt]="room.type + ' room'"
                      style="width: 100%; height: 100%; object-fit: cover; object-position: center;"
                      loading="lazy"
                    />
                  } @else {
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                      <span class="material-icons-outlined" style="font-size: 40px; color: var(--sand-300);">bed</span>
                    </div>
                  }
                  <!-- Availability badge -->
                  <span
                    style="position: absolute; top: 10px; right: 10px; padding: 3px 10px; border-radius: var(--r-pill); font-size: 11px; font-weight: 500; letter-spacing: 0.05em;"
                    [style.background]="room.status === 'Available' ? 'var(--glass-100)' : 'var(--sand-200)'"
                    [style.color]="room.status === 'Available' ? 'var(--glass-700)' : 'var(--fg-3)'"
                  >{{ room.status }}</span>
                </div>

                <!-- Room info -->
                <div style="padding: 16px 18px 18px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <h3 style="font-family: var(--font-display); font-size: var(--fs-base); font-weight: 400; color: var(--fg); margin: 0; letter-spacing: -0.01em;">{{ room.type }}</h3>
                    <span style="font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 400; color: var(--fg); font-variant-numeric: tabular-nums;">&#36;{{ room.priceOffPeak }}<span style="font-family: var(--font-sans); font-size: 11px; color: var(--fg-3); font-weight: 400;">/night</span></span>
                  </div>
                  <p style="font-size: var(--fs-xs); color: var(--fg-3); margin: 0 0 14px; display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-flex; align-items: center; gap: 3px;">
                      <span class="material-icons-outlined" style="font-size: 13px;">person</span>
                      Up to {{ room.capacity }}
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 3px;">
                      <span class="material-icons-outlined" style="font-size: 13px;">layers</span>
                      Floor {{ room.floorNumber }}
                    </span>
                  </p>
                  <p style="font-size: var(--fs-sm); color: var(--fg-2); margin: 0 0 16px; line-height: var(--lh-relaxed); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ room.description }}
                  </p>
                  <a
                    [routerLink]="['/rooms', room.id]"
                    style="display: block; width: 100%; padding: 9px 0; background: var(--sand-900); color: var(--sand-50); text-align: center; border-radius: var(--r-md); font-size: var(--fs-sm); font-weight: 600; text-decoration: none; transition: background var(--dur-fast) var(--ease-out);"
                    (mouseenter)="$any($event.currentTarget).style.background='var(--sand-800)'"
                    (mouseleave)="$any($event.currentTarget).style.background='var(--sand-900)'"
                  >
                    Book this room
                  </a>
                  @if (auth.isAuthenticated() && (auth.role() === 'Admin' || auth.canManageMedia())) {
                    <app-room-image-editor
                      [roomId]="room.id"
                      [currentImageUrl]="room.imageUrl"
                      (imageSaved)="onRoomImageSaved(room, $event)"
                    />
                  }
                </div>
              </article>
            }
          </div>
        }
      </div>
    }
  `,
})
export class HotelDetailComponent {
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);
  private readonly hotelsApi = inject(HotelsApiService);
  readonly auth              = inject(AuthService);

  readonly hotel        = signal<HotelDto | null>(null);
  readonly rooms        = signal<RoomDto[]>([]);
  readonly loading      = signal(true);
  readonly loadingRooms = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) { void this.router.navigate(['/hotel']); return; }

    this.hotelsApi.getById(id).subscribe({
      next: (h) => {
        this.hotel.set(h);
        this.loading.set(false);
        this.loadRooms(id);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadRooms(hotelId: number): void {
    this.loadingRooms.set(true);
    this.hotelsApi.getRooms(hotelId).subscribe({
      next: (r) => { this.rooms.set(r); this.loadingRooms.set(false); },
      error: () => this.loadingRooms.set(false),
    });
  }

  onRoomImageSaved(room: RoomDto, newUrl: string | null): void {
    this.rooms.update(list =>
      list.map(r => r.id === room.id ? { ...r, imageUrl: newUrl ?? undefined } : r)
    );
  }
}
