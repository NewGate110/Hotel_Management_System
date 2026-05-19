// Author: S2401265 Ahmed Aslan Ibrahim
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { roleDashboardPath } from '../../core/constants/roles';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen" style="background: var(--bg);">
      <!-- ─── FIXED NAVBAR ─── -->
      <header
        [class]="
          isTransparent()
            ? 'fixed inset-x-0 top-0 z-30 transition-all duration-300 ease-in-out border-b border-transparent'
            : 'fixed inset-x-0 top-0 z-30 transition-all duration-300 ease-in-out border-b backdrop-blur-xl'
        "
        [style]="isTransparent() ? '' : 'background: rgba(250,247,242,0.92); border-color: var(--border); box-shadow: var(--shadow-sm);'

        "
        role="banner"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-[18px]">
          <!-- Logo -->
          <a
            routerLink="/"
            class="relative block h-17 w-17 shrink-0"
            aria-label="Grand Plaza — home"
          >
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              class="absolute inset-0 h-full w-auto object-contain object-left transition-opacity duration-300"
              [class.opacity-0]="!isTransparent()"
            />
            <img
              src="/logo-dark.png"
              alt=""
              aria-hidden="true"
              class="absolute inset-0 h-full w-auto object-contain object-left transition-opacity duration-300"
              [class.opacity-0]="isTransparent()"
            />
          </a>

          <!-- Desktop nav pill -->
          <nav
            class="hidden items-center gap-0.5 rounded-full px-2 py-1 text-[13px] transition-all duration-300 md:flex"
            [class]="
              isTransparent()
                ? 'border border-white/20 bg-white/10 backdrop-blur-sm'
                : 'border border-[var(--border)] bg-[var(--surface)]'
            "
            aria-label="Site navigation"
          >
            <a
              routerLink="/"
              routerLinkActive
              #rla0="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              [class]="navLinkClass(rla0)"
              >Home</a
            >
            <a
              routerLink="/rooms/search"
              routerLinkActive
              #rla1="routerLinkActive"
              [class]="navLinkClass(rla1)"
              >Rooms</a
            >
            <a
              routerLink="/hotel"
              routerLinkActive
              #rla2="routerLinkActive"
              [class]="navLinkClass(rla2)"
              >Hotel</a
            >
            <a
              routerLink="/contact"
              routerLinkActive
              #rla3="routerLinkActive"
              [class]="navLinkClass(rla3)"
              >Contact</a
            >
          </nav>

          <!-- CTA / user area + mobile hamburger -->
          <div class="flex items-center gap-2">
            @if (auth.isAuthenticated()) {
              <!-- Authenticated: avatar + dashboard link + sign out -->
              <a
                [routerLink]="dashboardPath()"
                class="hidden rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 sm:block"
                [class]="
                  isTransparent()
                    ? 'border border-white/30 text-white hover:bg-white/10'
                    : 'border border-[var(--border-strong)] text-[var(--fg-2)] hover:bg-[var(--sand-100)] hover:text-[var(--fg)]'
                "
                >Dashboard</a
              >

              <!-- Avatar chip -->
              <button
                type="button"
                (click)="auth.logout()"
                class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold transition-all duration-200"
                [class]="
                  isTransparent()
                    ? 'bg-white/15 text-white hover:bg-white/25'
                    : 'bg-[var(--sand-900)] text-[var(--sand-50)] hover:bg-[var(--sand-800)]'
                "
                title="Sign out"
              >
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                  [class]="isTransparent() ? 'bg-white/30 text-white' : 'bg-white/20 text-white'"
                  >{{ initials() }}</span
                >
                <span class="hidden sm:block">Sign out</span>
              </button>
            } @else {
              <!-- Guest: sign in + register -->
              <a
                routerLink="/login"
                class="hidden rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 sm:block"
                [class]="
                  isTransparent()
                    ? 'border border-white/30 text-white hover:bg-white/10'
                    : 'border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--sand-100)]'
                "
                >Sign in</a
              >
              <a
                routerLink="/register"
                class="rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200"
                [class]="
                  isTransparent()
                    ? 'bg-white text-[var(--sand-900)] hover:bg-[var(--sand-100)]'
                    : 'bg-[var(--sand-900)] text-[var(--sand-50)] hover:bg-[var(--sand-800)]'
                "
                >Register</a
              >
            }

            <!-- Hamburger — mobile only -->
            <button
              type="button"
              (click)="mobileOpen.update((v) => !v)"
              class="ml-1 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 md:hidden"
              [class]="
                isTransparent() ? 'text-white hover:bg-white/10' : 'text-[var(--fg-2)] hover:bg-[var(--sand-100)]'
              "
              [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
              [attr.aria-expanded]="mobileOpen()"
            >
              <span class="material-icons-outlined text-xl" aria-hidden="true">
                {{ mobileOpen() ? 'close' : 'menu' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mobile menu panel -->
        @if (mobileOpen()) {
          <nav
            class="border-t px-4 pb-5 pt-3 md:hidden"
            [class]="
              isTransparent()
                ? 'border-white/10 backdrop-blur-xl'
                : 'border-[var(--border)] backdrop-blur-xl'
            "
            [style]="isTransparent() ? 'background: rgba(14,36,48,0.88);' : 'background: rgba(250,247,242,0.96);'"
            aria-label="Mobile navigation"
          >
            <div class="flex flex-col gap-0.5">
              <a
                routerLink="/"
                routerLinkActive
                #mrla0="routerLinkActive"
                [routerLinkActiveOptions]="{ exact: true }"
                [class]="mobileLinkClass(mrla0)"
                >Home</a
              >
              <a
                routerLink="/rooms/search"
                routerLinkActive
                #mrla1="routerLinkActive"
                [class]="mobileLinkClass(mrla1)"
                >Rooms</a
              >
              <a
                routerLink="/hotel"
                routerLinkActive
                #mrla2="routerLinkActive"
                [class]="mobileLinkClass(mrla2)"
                >Hotel</a
              >
              <a
                routerLink="/contact"
                routerLinkActive
                #mrla3="routerLinkActive"
                [class]="mobileLinkClass(mrla3)"
                >Contact</a
              >
            </div>

            <div
              class="mt-3 flex flex-wrap gap-2 border-t pt-3"
              [class]="isTransparent() ? 'border-white/10' : 'border-[var(--border)]'"
            >
              @if (auth.isAuthenticated()) {
                <a
                  [routerLink]="dashboardPath()"
                  class="flex-1 rounded-xl py-2.5 text-center text-sm font-medium transition-colors"
                  [class]="
                    isTransparent()
                      ? 'border border-white/25 text-white hover:bg-white/10'
                      : 'border border-[var(--border-strong)] text-[var(--fg-2)] hover:bg-[var(--sand-100)] hover:text-[var(--fg)]'
                  "
                  >Dashboard</a
                >
                <button
                  type="button"
                  (click)="auth.logout()"
                  class="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors"
                  [class]="isTransparent() ? 'bg-white text-[var(--sand-900)]' : 'bg-[var(--sand-900)] text-[var(--sand-50)]'"
                >
                  Sign out
                </button>
              } @else {
                <a
                  routerLink="/login"
                  class="flex-1 rounded-xl py-2.5 text-center text-sm font-medium transition-colors"
                  [class]="
                    isTransparent()
                      ? 'border border-white/25 text-white hover:bg-white/10'
                      : 'border border-[var(--border-strong)] text-[var(--fg-2)] hover:bg-[var(--sand-100)] hover:text-[var(--fg)]'
                  "
                  >Sign in</a
                >
                <a
                  routerLink="/register"
                  class="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors"
                  [class]="isTransparent() ? 'bg-white text-[var(--sand-900)]' : 'bg-[var(--sand-900)] text-[var(--sand-50)]'"
                  >Register</a
                >
              }
            </div>
          </nav>
        }
      </header>

      <main [style.paddingTop]="isHeroPage() ? null : '68px'">
        <router-outlet />
      </main>
    </div>
  `,
})
export class PublicLayoutComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly scrolled = signal(false);
  readonly mobileOpen = signal(false);
  readonly isHeroPage = signal(false);

  readonly initials = computed(() => {
    const name = this.auth.fullName();
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  });

  readonly dashboardPath = computed(() => {
    const role = this.auth.role();
    return role ? roleDashboardPath(role) : '/app';
  });

  constructor() {
    this.isHeroPage.set(this.router.url === '/');

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.isHeroPage.set(url === '/');
        this.scrolled.set(window.scrollY > 60);
        this.mobileOpen.set(false);
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
  }

  isTransparent(): boolean {
    return this.isHeroPage() && !this.scrolled();
  }

  navLinkClass(rla: { isActive: boolean }): string {
    const base = 'rounded-full px-3.5 py-1.5 font-medium transition-all duration-200';
    if (this.isTransparent()) {
      return rla.isActive
        ? `${base} bg-white/20 text-white`
        : `${base} text-white/75 hover:text-white hover:bg-white/10`;
    }
    return rla.isActive
      ? `${base} bg-[var(--sand-900)] text-[var(--sand-50)]`
      : `${base} text-[var(--fg-2)] hover:bg-[var(--sand-100)] hover:text-[var(--fg)]`;
  }

  mobileLinkClass(rla: { isActive: boolean }): string {
    const base = 'block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors';
    if (this.isTransparent()) {
      return rla.isActive
        ? `${base} bg-white/20 text-white font-semibold`
        : `${base} text-white/75 hover:bg-white/10 hover:text-white`;
    }
    return rla.isActive
      ? `${base} bg-[var(--sand-100)] text-[var(--fg)] font-semibold`
      : `${base} text-[var(--fg-2)] hover:bg-[var(--bg-alt)] hover:text-[var(--fg)]`;
  }
}
