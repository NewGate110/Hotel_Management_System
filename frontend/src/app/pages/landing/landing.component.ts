// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { map } from 'rxjs/operators';
import { FormatTypePipe } from '../../shared/pipes/format-type.pipe';
import { RoomsApiService } from '../../core/services/rooms-api.service';
import type { RoomSearchResultItem } from '../../core/models/room.models';

interface Faq {
  q: string;
  a: string;
}
interface Review {
  name: string;
  role: string;
  text: string;
  initials: string;
}

function toYmd(d: Date): string {
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    FormatTypePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ─── HERO ─── -->
    <section
      style="position: relative; min-height: 92vh; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; padding-bottom: 48px;"
    >
      <img
        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2000&q=80"
        alt=""
        style="pointer-events: none; position: absolute; inset: -6px; width: calc(100% + 12px); height: calc(100% + 12px); object-fit: cover; filter: blur(5px);"
        loading="eager"
      />
      <div
        style="pointer-events: none; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,36,48,0.35) 0%, rgba(14,36,48,0.45) 45%, rgba(14,36,48,0.85) 100%);"
        aria-hidden="true"
      ></div>

      <div class="container-wide" style="position: relative; z-index: 10; padding-top: 140px;">
        <p class="eyebrow" style="color: var(--clay-200); letter-spacing: var(--ls-widest);">
          Grand Plaza Hotel
        </p>

        <h1
          style="font-family: var(--font-display); font-size: clamp(44px,7vw,84px); font-weight: 300; letter-spacing: -0.035em; line-height: 1.02; color: var(--sand-50); max-width: 960px; margin: 16px 0 0; text-wrap: balance;"
        >
          Begin your dream stay<br />with paradise at your feet
        </h1>
        <p class="lead" style="color: var(--sand-100); max-width: 520px; margin: 20px 0 0;">
          Private island luxury, pristine coral reefs, and award-winning hospitality in the heart of
          the Indian Ocean.
        </p>

        <!-- Booking widget -->
        <div
          [formGroup]="searchForm"
          style="margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; align-items: flex-start; background: var(--surface); border-radius: var(--r-lg); padding: 20px 24px; max-width: 860px; box-shadow: var(--shadow-lg);"
          class="booking-widget"
        >
          <!-- Check-in -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Check-in</mat-label>
            <input matInput [matDatepicker]="ci" [min]="minDate" formControlName="checkIn" />
            <mat-datepicker-toggle matIconSuffix [for]="ci" />
            <mat-datepicker #ci />
          </mat-form-field>
          <!-- Check-out -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Check-out</mat-label>
            <input matInput [matDatepicker]="co" [min]="minDate" formControlName="checkOut" />
            <mat-datepicker-toggle matIconSuffix [for]="co" />
            <mat-datepicker #co />
          </mat-form-field>
          <!-- Guests -->
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
          <!-- Search button -->
          <div style="display: flex; align-items: flex-end; padding-bottom: 1px;">
            <button
              type="button"
              (click)="search()"
              [disabled]="loading()"
              class="btn btn-primary btn-lg"
              style="height: 56px; white-space: nowrap;"
            >
              <span class="material-icons-outlined" style="font-size: 18px;" aria-hidden="true"
                >search</span
              >
              Search
            </button>
          </div>
        </div>

        @if (dateError()) {
          <div
            style="margin-top: 16px; padding: 12px 14px; background: var(--clay-100); border-radius: var(--r-md); font-size: var(--fs-sm); color: var(--clay-700);"
          >
            {{ dateError() }}
          </div>
        }

        @if (!searched()) {
          <p
            style="margin-top: 32px; display: flex; align-items: center; gap: 6px; font-size: var(--fs-xs); color: rgba(250,247,242,0.4);"
          >
            <span class="material-icons-outlined" style="font-size: 16px;" aria-hidden="true"
              >south</span
            >
            Scroll to explore
          </p>
        }
      </div>
    </section>

    <!-- ─── SEARCH RESULTS ─── -->
    @if (searched()) {
      <section id="search-results" style="background: var(--bg-alt); padding: 64px 0;">
        <div class="container-wide">
          @if (loading()) {
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              @for (s of [1, 2, 3, 4, 5, 6]; track s) {
                <div
                  style="animation: pulse 1.5s ease-in-out infinite; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px;"
                >
                  <div
                    style="height: 14px; width: 75%; background: var(--sand-200); border-radius: 4px; margin-bottom: 12px;"
                  ></div>
                  <div
                    style="height: 12px; width: 50%; background: var(--sand-100); border-radius: 4px; margin-bottom: 24px;"
                  ></div>
                  <div
                    style="height: 40px; width: 100%; background: var(--sand-100); border-radius: 4px;"
                  ></div>
                </div>
              }
            </div>
          } @else if (results().length === 0) {
            <div
              style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; text-align: center;"
            >
              <span
                class="material-icons-outlined"
                style="font-size: 48px; color: var(--sand-300);"
                aria-hidden="true"
                >search_off</span
              >
              <p
                style="margin-top: 20px; font-family: var(--font-display); font-size: var(--fs-xl); color: var(--fg);"
              >
                No rooms found
              </p>
              <p style="margin-top: 8px; font-size: var(--fs-sm); color: var(--fg-3);">
                Try adjusting your dates or lower the guest count.
              </p>
            </div>
          } @else {
            <div
              style="margin-bottom: 32px; display: flex; align-items: baseline; justify-content: space-between;"
            >
              <div>
                <h2
                  style="font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 400; color: var(--fg); margin: 0;"
                >
                  Available rooms
                </h2>
                <p style="margin-top: 4px; font-size: var(--fs-xs); color: var(--fg-3);">
                  {{ results().length }} room{{ results().length === 1 ? '' : 's' }} found
                </p>
              </div>
              <a routerLink="/rooms/search" class="btn btn-secondary btn-sm">Advanced search</a>
            </div>
            <div
              style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch;"
              class="results-grid"
            >
              @for (room of results(); track room.roomId) {
                <div
                  class="room-card card-surface"
                  style="overflow: hidden; transition: box-shadow var(--dur-slow) var(--ease-glide); display: flex; flex-direction: column; height: 100%;"
                >
                  <div style="padding: 20px 22px 12px;">
                    <div
                      style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;"
                    >
                      <div style="min-width: 0; flex: 1;">
                        <span class="badge badge-info">{{ room.type | formatType }}</span>
                        <p
                          style="margin: 8px 0 0; font-size: var(--fs-sm); color: var(--fg-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                        >
                          {{ room.hotelName }}
                        </p>
                        <p style="font-size: var(--fs-xs); color: var(--fg-3);">
                          {{ room.city }}, {{ room.country }}
                        </p>
                      </div>
                      <div style="text-align: right; flex-shrink: 0;">
                        <span class="price" style="font-size: 24px;"
                          >&#36;{{ room.pricePerNight }}</span
                        >
                        <p class="price-unit" style="display: block; margin: 0;">/ night</p>
                      </div>
                    </div>
                  </div>
                  <p
                    style="padding: 0 22px; font-size: 13px; line-height: 1.55; color: var(--fg-3); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
                  >
                    {{ room.description }}
                  </p>
                  <div class="rule" style="margin: 16px 0 0;"></div>
                  <div
                    style="display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; margin-top: auto;"
                  >
                    <div
                      style="display: flex; align-items: center; gap: 12px; font-size: var(--fs-xs); color: var(--fg-3);"
                    >
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
                      >View details</a
                    >
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>
    }

    <!-- ─── FEATURED SUITES ─── -->
    <section style="padding: 128px 0; background: var(--bg);">
      <div class="container-wide">
        <div
          style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px;"
        >
          <div>
            <p class="eyebrow">Our Rooms</p>
            <h2
              style="font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 400; letter-spacing: var(--ls-tight); color: var(--fg); margin: 12px 0 0; text-wrap: balance; max-width: 560px;"
            >
              Explore our exclusive collection of rooms &amp; villas
            </h2>
          </div>
          <a routerLink="/rooms/search" class="btn btn-secondary" style="flex-shrink: 0;"
            >View all rooms →</a
          >
        </div>
        <div class="rule-ink" style="margin-bottom: 40px;"></div>

        <div
          style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"
          class="suites-grid"
        >
          @for (room of featuredRooms(); track room.roomId) {
            <div
              class="suite-card"
              style="background: var(--surface); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow var(--dur-slow) var(--ease-glide);"
            >
              <div style="aspect-ratio: 4/3; overflow: hidden;">
                <img
                  [src]="
                    room.imageUrl ||
                    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=700&q=80'
                  "
                  [alt]="room.type | formatType"
                  style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-glide);"
                />
              </div>
              <div style="padding: 24px;">
                <span
                  style="display: inline-block; font-size: var(--fs-xs); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brand); margin-bottom: 8px;"
                  >{{ room.city }}</span
                >
                <h3
                  style="font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 300; color: var(--fg); margin: 0 0 8px;"
                >
                  {{ room.type | formatType }}
                </h3>
                <p
                  style="font-size: var(--fs-sm); color: var(--fg-2); line-height: 1.6; margin: 0 0 20px;"
                >
                  {{ room.description }}
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span
                    style="font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 400; color: var(--fg);"
                    >from \${{ room.pricePerNight
                    }}<span
                      style="font-family: var(--font-sans); font-size: var(--fs-xs); color: var(--fg-3); margin-left: 4px;"
                      >/ night</span
                    ></span
                  >
                  <a
                    [routerLink]="['/rooms', room.roomId]"
                    style="font-size: var(--fs-sm); font-weight: 500; color: var(--brand); text-decoration: none;"
                    >View room →</a
                  >
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── EXPERIENCES ─── -->
    <section style="padding: 128px 0; background: var(--bg-alt);">
      <div class="container-wide">
        <p class="eyebrow" style="text-align: center;">On Property</p>
        <h2
          style="font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 400; letter-spacing: var(--ls-tight); color: var(--fg); text-align: center; margin: 12px 0 0; text-wrap: balance;"
        >
          The day unstructures itself.
        </h2>
        <div
          style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-top: 64px; align-items: stretch;"
          class="experiences-grid"
        >
          @for (exp of experiences; track exp.label) {
            <div style="height: 100%;">
              <span
                class="material-icons-outlined"
                style="font-size: 32px; color: var(--brand);"
                aria-hidden="true"
                >{{ exp.icon }}</span
              >
              <h4
                style="font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 400; color: var(--fg); margin: 20px 0 8px;"
              >
                {{ exp.label }}
              </h4>
              <p style="font-size: var(--fs-sm); color: var(--fg-2); line-height: 1.6;">
                {{ exp.blurb }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── AMENITIES STRIP ─── -->
    <section
      style="padding: 48px 0; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);"
    >
      <div
        class="container-wide"
        style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 48px 64px;"
      >
        @for (amenity of amenities; track amenity.label) {
          <div
            style="display: flex; align-items: center; gap: 10px; font-size: var(--fs-sm); font-weight: 500; color: var(--fg-2);"
          >
            <span
              class="material-icons-outlined"
              style="font-size: 22px; color: var(--brand);"
              aria-hidden="true"
              >{{ amenity.icon }}</span
            >
            {{ amenity.label }}
          </div>
        }
      </div>
    </section>

    <!-- ─── ROOMS GALLERY ─── -->
    <section style="padding: 128px 0; background: var(--bg);">
      <div class="container-wide">
        <p class="eyebrow">Gallery</p>
        <h2
          style="font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 400; letter-spacing: var(--ls-tight); color: var(--fg); margin: 12px 0 0; text-wrap: balance; max-width: 560px;"
        >
          Every room a world of its own
        </h2>
        <div
          style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; grid-template-rows: auto auto;"
          class="gallery-grid"
        >
          <a
            routerLink="/rooms/search"
            class="gallery-card"
            style="grid-row: span 2; position: relative; overflow: hidden; border-radius: var(--r-xl); height: 456px; display: block; text-decoration: none;"
          >
            <img
              src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80"
              alt="Overwater Bungalow"
              style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-glide) var(--ease-glide);"
              class="gallery-img"
            />
            <div
              style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,24,32,0.82) 0%, rgba(8,24,32,0.1) 50%, transparent 100%);"
            ></div>
            <div style="position: absolute; bottom: 0; left: 0; padding: 28px;">
              <p class="eyebrow" style="color: rgba(250,247,242,0.55);">Most Popular</p>
              <p
                style="margin-top: 4px; font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 400; color: var(--sand-50);"
              >
                Overwater Bungalow
              </p>
              <p style="margin-top: 6px; font-size: 13px; color: rgba(250,247,242,0.6);">
                Direct lagoon access · Private sun deck · Glass floor
              </p>
              <span
                style="margin-top: 16px; display: inline-block; font-size: 13px; font-weight: 500; color: var(--clay-200); text-decoration: underline; text-underline-offset: 3px;"
                >Explore rooms →</span
              >
            </div>
          </a>
          <a
            routerLink="/rooms/search"
            class="gallery-card"
            style="position: relative; height: 220px; overflow: hidden; border-radius: var(--r-xl); display: block; text-decoration: none;"
          >
            <img
              src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80"
              alt="Beach Villa"
              style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-glide) var(--ease-glide);"
              class="gallery-img"
            />
            <div
              style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,24,32,0.75) 0%, transparent 60%);"
            ></div>
            <div style="position: absolute; bottom: 0; left: 0; padding: 20px;">
              <p
                style="font-family: var(--font-display); font-size: var(--fs-lg); color: var(--sand-50);"
              >
                Beach Villa
              </p>
              <p style="margin-top: 4px; font-size: 13px; color: rgba(250,247,242,0.6);">
                Private beach · Ocean breeze
              </p>
            </div>
          </a>
          <a
            routerLink="/rooms/search"
            class="gallery-card"
            style="position: relative; height: 220px; overflow: hidden; border-radius: var(--r-xl); display: block; text-decoration: none;"
          >
            <img
              src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=900&q=80"
              alt="Ocean Suite"
              style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-glide) var(--ease-glide);"
              class="gallery-img"
            />
            <div
              style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,24,32,0.75) 0%, transparent 60%);"
            ></div>
            <div style="position: absolute; bottom: 0; left: 0; padding: 20px;">
              <p
                style="font-family: var(--font-display); font-size: var(--fs-lg); color: var(--sand-50);"
              >
                Ocean Suite
              </p>
              <p style="margin-top: 4px; font-size: 13px; color: rgba(250,247,242,0.6);">
                360° panoramic views · Infinity pool
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ─── TESTIMONIALS ─── -->
    <section style="padding: 128px 0; background: var(--azure-800);">
      <div class="container">
        <p class="eyebrow" style="color: var(--clay-200);">Guest Stories</p>
        <div style="max-width: 720px; margin-top: 48px;">
          <blockquote
            style="font-family: var(--font-display); font-style: italic; font-weight: 300; font-size: 40px; letter-spacing: -0.02em; line-height: 1.25; color: var(--sand-50); margin: 0;"
          >
            "{{ reviews[activeReview()].text }}"
          </blockquote>
          <div
            style="margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(250,247,242,0.2); display: flex; align-items: center; justify-content: space-between;"
          >
            <div>
              <p style="font-size: var(--fs-base); font-weight: 500; color: var(--sand-50);">
                {{ reviews[activeReview()].name }}
              </p>
              <p style="font-size: var(--fs-sm); color: var(--sand-300); margin-top: 2px;">
                {{ reviews[activeReview()].role }}
              </p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                style="color: var(--sand-50); border: 1px solid rgba(250,247,242,0.3);"
                (click)="prevReview()"
              >
                <span class="material-icons-outlined" style="font-size: 18px;">arrow_back</span>
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                style="color: var(--sand-50); border: 1px solid rgba(250,247,242,0.3);"
                (click)="nextReview()"
              >
                <span class="material-icons-outlined" style="font-size: 18px;">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FAQ ─── -->
    <section style="padding: 128px 0; background: var(--bg-alt);">
      <div
        class="container-wide"
        style="display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;"
        class="faq-grid"
      >
        <div>
          <p class="eyebrow">FAQs</p>
          <h2
            style="font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 400; letter-spacing: var(--ls-tight); color: var(--fg); margin: 12px 0 0; text-wrap: balance;"
          >
            Frequently Asked Questions
          </h2>
          <p
            style="margin-top: 20px; font-size: var(--fs-base); line-height: var(--lh-normal); color: var(--fg-2);"
          >
            We believe in clear, honest communication. Here are the questions we hear most from our
            guests.
          </p>
        </div>
        <div>
          @for (faq of faqs; track faq.q; let i = $index) {
            <div style="border-bottom: 1px solid var(--border);">
              <button
                type="button"
                (click)="toggleFaq(i)"
                style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-align: left; padding: 20px 0; background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-size: var(--fs-base); font-weight: 500; color: var(--fg);"
                [style.color]="openFaq() === i ? 'var(--brand)' : 'var(--fg)'"
              >
                <span>{{ faq.q }}</span>
                <span
                  class="material-icons-outlined"
                  style="flex-shrink: 0; font-size: 20px; color: var(--fg-3); transition: transform var(--dur-base) var(--ease-out);"
                  [style.transform]="openFaq() === i ? 'rotate(180deg)' : 'rotate(0deg)'"
                  aria-hidden="true"
                  >expand_more</span
                >
              </button>
              @if (openFaq() === i) {
                <p
                  style="font-size: var(--fs-sm); line-height: var(--lh-loose); color: var(--fg-2); padding-bottom: 20px; margin: 0;"
                >
                  {{ faq.a }}
                </p>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ─── CTA ─── -->
    <section style="position: relative; overflow: hidden; padding: 112px 0;">
      <img
        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2000&q=80"
        alt=""
        style="pointer-events: none; position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55;"
        aria-hidden="true"
      />
      <div
        style="pointer-events: none; position: absolute; inset: 0; background: rgba(8,24,32,0.7);"
        aria-hidden="true"
      ></div>
      <div class="container" style="position: relative; z-index: 10; text-align: center;">
        <h2
          style="font-family: var(--font-display); font-size: clamp(32px, 5vw, 56px); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--sand-50); margin: 0; text-wrap: balance;"
        >
          Don't wait any longer.<br />Start your adventure today.
        </h2>
        <p
          style="margin-top: 20px; font-size: var(--fs-base); line-height: var(--lh-normal); color: rgba(250,247,242,0.6); max-width: 500px; margin-left: auto; margin-right: auto;"
        >
          Book directly and enjoy our best-rate guarantee, exclusive perks, and personalised
          pre-arrival concierge.
        </p>
        <div
          style="margin-top: 32px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;"
        >
          <a routerLink="/rooms/search" class="btn btn-accent btn-lg">
            <span class="material-icons-outlined" style="font-size: 18px;" aria-hidden="true"
              >search</span
            >
            Browse Rooms
          </a>
          <a
            routerLink="/contact"
            class="btn"
            style="color: var(--sand-50); background: rgba(250,247,242,0.1); border-color: rgba(250,247,242,0.25); font-size: 15px; padding: 16px 28px;"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer style="background: var(--sand-900); padding: 96px 0 0;">
      <div class="container-wide">
        <div
          style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 48px; padding-bottom: 64px; border-bottom: 1px solid rgba(212,200,179,0.15);"
          class="footer-grid"
        >
          <div>
            <a routerLink="/" aria-label="Grand Plaza — home">
              <img src="/logo.png" alt="" aria-hidden="true" style="width: 200px;" />
            </a>
            <p
              style="margin-top: 24px; font-size: var(--fs-sm); color: var(--sand-300); line-height: var(--lh-normal); max-width: 320px;"
            >
              Personalised luxury from your own private island in the heart of the Indian Ocean.
            </p>
            <div style="margin-top: 20px; display: flex; gap: 16px;">
              <span
                class="material-icons-outlined"
                style="cursor: pointer; font-size: 20px; color: var(--sand-500); transition: color var(--dur-fast) var(--ease-out);"
                onmouseenter="this.style.color='var(--sand-200)'"
                onmouseleave="this.style.color='var(--sand-500)'"
                >language</span
              >
              <span
                class="material-icons-outlined"
                style="cursor: pointer; font-size: 20px; color: var(--sand-500); transition: color var(--dur-fast) var(--ease-out);"
                onmouseenter="this.style.color='var(--sand-200)'"
                onmouseleave="this.style.color='var(--sand-500)'"
                >phone</span
              >
              <span
                class="material-icons-outlined"
                style="cursor: pointer; font-size: 20px; color: var(--sand-500); transition: color var(--dur-fast) var(--ease-out);"
                onmouseenter="this.style.color='var(--sand-200)'"
                onmouseleave="this.style.color='var(--sand-500)'"
                >mail</span
              >
            </div>
          </div>

          @for (col of footerCols; track col.title) {
            <div>
              <p
                style="font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sand-400); margin: 0 0 16px;"
              >
                {{ col.title }}
              </p>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                @for (link of col.links; track link.label) {
                  <a
                    [routerLink]="link.path"
                    style="font-size: var(--fs-sm); color: var(--sand-200); text-decoration: none; transition: color var(--dur-fast) var(--ease-out);"
                    onmouseenter="this.style.color='var(--white)'"
                    onmouseleave="this.style.color='var(--sand-200)'"
                    >{{ link.label }}</a
                  >
                }
              </div>
            </div>
          }
        </div>

        <div
          style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 0; font-size: var(--fs-xs); color: var(--sand-400);"
        >
          <p style="margin: 0;">© {{ year }} Grand Plaza. All rights reserved.</p>
          <div style="display: flex; gap: 24px;">
            <span
              style="cursor: pointer; transition: color var(--dur-fast);"
              onmouseenter="this.style.color='var(--sand-200)'"
              onmouseleave="this.style.color='var(--sand-400)'"
              >Privacy Policy</span
            >
            <span
              style="cursor: pointer; transition: color var(--dur-fast);"
              onmouseenter="this.style.color='var(--sand-200)'"
              onmouseleave="this.style.color='var(--sand-400)'"
              >Terms &amp; Conditions</span
            >
          </div>
        </div>
      </div>
    </footer>

    <style>
      @media (max-width: 768px) {
        .booking-widget {
          grid-template-columns: 1fr !important;
        }
        .suites-grid {
          grid-template-columns: 1fr !important;
        }
        .experiences-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .gallery-grid {
          grid-template-columns: 1fr !important;
        }
        .faq-grid {
          grid-template-columns: 1fr !important;
        }
        .footer-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .results-grid {
          grid-template-columns: 1fr !important;
        }
      }
      .suite-card:hover {
        box-shadow: var(--shadow-md) !important;
      }
      .suite-card:hover .suite-img {
        transform: scale(1.03);
      }
      .gallery-card:hover .gallery-img {
        transform: scale(1.03);
      }
      .room-card:hover {
        box-shadow: var(--shadow-md) !important;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    </style>
  `,
})
export class LandingComponent implements OnInit {
  private readonly roomsApi = inject(RoomsApiService);
  private readonly fb = inject(FormBuilder);

  readonly openFaq = signal<number | null>(null);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly results = signal<RoomSearchResultItem[]>([]);
  readonly dateError = signal<string | null>(null);
  readonly year = new Date().getFullYear();
  readonly lastSearch = signal<{ checkIn?: string; checkOut?: string; guests?: number }>({});
  readonly activeReview = signal(0);

  readonly minDate = new Date();

  readonly searchForm = this.fb.nonNullable.group({
    checkIn: [new Date()],
    checkOut: [new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)],
    guests: [null as number | null],
  });

  search(): void {
    this.dateError.set(null);
    const { checkIn, checkOut, guests } = this.searchForm.getRawValue();
    if (!checkIn) {
      this.dateError.set('Please select a check-in date.');
      return;
    }
    if (!checkOut) {
      this.dateError.set('Please select a check-out date.');
      return;
    }
    if (checkOut <= checkIn) {
      this.dateError.set('Check-out date must be after check-in date.');
      return;
    }
    if (this.loading()) return;

    const checkInStr = toYmd(checkIn);
    const checkOutStr = toYmd(checkOut);
    const guestCount = guests ?? undefined;

    this.lastSearch.set({ checkIn: checkInStr, checkOut: checkOutStr, guests: guestCount });
    this.loading.set(true);
    this.searched.set(true);
    this.results.set([]);

    setTimeout(
      () => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }),
      0,
    );

    this.roomsApi
      .searchRooms({ checkIn: checkInStr, checkOut: checkOutStr, guests: guestCount })
      .subscribe({
        next: (r) => {
          this.results.set(r.results);
          this.loading.set(false);
        },
        error: () => {
          this.results.set([]);
          this.loading.set(false);
        },
      });
  }

  toggleFaq(i: number): void {
    this.openFaq.update((v) => (v === i ? null : i));
  }
  nextReview(): void {
    this.activeReview.update((v) => (v + 1) % this.reviews.length);
  }
  prevReview(): void {
    this.activeReview.update((v) => (v - 1 + this.reviews.length) % this.reviews.length);
  }

  readonly featuredRooms = signal<RoomSearchResultItem[]>([]);

  ngOnInit(): void {
    this.roomsApi
      .searchRooms({})
      .pipe(
        map((res) =>
          [...res.results].sort((a, b) => b.pricePerNight - a.pricePerNight).slice(0, 3),
        ),
      )
      .subscribe((rooms) => this.featuredRooms.set(rooms));
  }

  readonly experiences = [
    {
      icon: 'spa',
      label: 'Luxury Spa',
      blurb: 'Nine treatments from hot stone to deep tissue, with ocean-view treatment rooms.',
    },
    {
      icon: 'restaurant',
      label: 'Fine Dining',
      blurb: 'Candlelit dinners above the lagoon. Locally sourced, seasonally led.',
    },
    {
      icon: 'waves',
      label: 'Water Sports',
      blurb: 'Snorkel, kayak, and dive from your private beach at any hour.',
    },
    {
      icon: 'wb_sunny',
      label: 'Golden Hour',
      blurb: 'Guided sunset cruises and rooftop cocktails every evening.',
    },
  ];

  readonly amenities = [
    { icon: 'pool', label: 'Infinity Pool' },
    { icon: 'spa', label: 'Luxury Spa' },
    { icon: 'restaurant', label: 'Fine Dining' },
    { icon: 'surfing', label: 'Water Sports' },
    { icon: 'directions_boat', label: 'Private Transfer' },
  ];

  readonly faqs: Faq[] = [
    {
      q: 'How do I book a room at Grand Plaza?',
      a: 'Browse rooms directly on the website, select your preferred villa type and travel dates, then complete your reservation with your guest account. Instant confirmation is sent by email.',
    },
    {
      q: 'What is included in the room rate?',
      a: 'All rates include daily breakfast for two, complimentary snorkelling equipment, high-speed Wi-Fi, and non-motorised water sports. Premium packages add full-board dining and spa credits.',
    },
    {
      q: 'How do I reach the hotel?',
      a: 'Grand Plaza is a 30-minute speedboat transfer or a 15-minute scenic seaplane flight from the international airport. Private transfers can be arranged at booking.',
    },
    {
      q: 'What is the cancellation policy?',
      a: 'Bookings cancelled 14 or more days before check-in receive a full refund. Cancellations within 14 days incur a one-night retention fee. No-shows are non-refundable.',
    },
    {
      q: 'Do you host private events?',
      a: 'Yes — we specialise in intimate beach ceremonies, sunset lagoon dinners, and corporate retreats. Contact our events concierge team for a bespoke proposal.',
    },
  ];

  readonly reviews: Review[] = [
    {
      name: 'Sophia Linden',
      role: 'Honeymooner · United Kingdom',
      text: 'An absolute dream from start to finish. The overwater bungalow was breathtaking, and the staff anticipated our every need before we even thought to ask.',
      initials: 'SL',
    },
    {
      name: 'James Whitfield',
      role: 'Business Traveller · Australia',
      text: 'Impeccable service paired with jaw-dropping surroundings. The glass-floor bungalow and private sun deck made this the most luxurious trip I have ever taken.',
      initials: 'JW',
    },
    {
      name: 'Aisha Rahman',
      role: 'Family Holiday · UAE',
      text: 'The family villa was perfect for all of us. Our children loved the marine biologist snorkel tour — they have not stopped talking about it since we got home.',
      initials: 'AR',
    },
    {
      name: 'Marcus Chen',
      role: 'Solo Traveller · Singapore',
      text: 'I booked for a week and wanted to stay indefinitely. The sunset deck dinners, the spa, and the quiet of the private island are beyond anything I have experienced.',
      initials: 'MC',
    },
  ];

  readonly footerCols = [
    {
      title: 'Navigate',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Rooms', path: '/rooms/search' },
        { label: 'Hotel Info', path: '/hotel' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Guest Services',
      links: [
        { label: 'Sign In', path: '/login' },
        { label: 'Register', path: '/register' },
        { label: 'Book a Room', path: '/rooms/search' },
        { label: 'Support', path: '/contact' },
      ],
    },
    {
      title: 'On Property',
      links: [
        { label: 'The Spa', path: '/hotel' },
        { label: 'Dining', path: '/hotel' },
        { label: 'Experiences', path: '/hotel' },
        { label: 'Transfers', path: '/contact' },
      ],
    },
  ];
}
