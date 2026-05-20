// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/auth/auth.service';
import type { UserRole } from '../../../core/constants/roles';
import { isUserRole } from '../../../core/constants/roles';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { MSG } from '../../../core/i18n/ui-messages';
import { environment } from '../../../../environments/environment';

interface DemoUser { role: string; name: string; email: string; password: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; min-height: calc(100vh - 68px);">
      <!-- Left: hero image -->
      <div style="position: relative; flex: 1; display: none;" class="login-hero">
        <img
          src="https://images.unsplash.com/photo-1574223706388-0e0f6f0390b2?h=1200&w=800&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          style="height: 100%; width: 100%; object-fit: cover;"
        />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,36,48,0.25) 0%, rgba(14,36,48,0.05) 40%, rgba(14,36,48,0.75) 100%);"></div>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 48px;">
          <img src="/logo.png" alt="Grand Plaza" style="margin-bottom: 24px; height: 48px; width: auto; object-fit: contain; object-position: left; filter: invert(0.92) brightness(1.1);" />
          <p style="font-family: var(--font-display); font-size: var(--fs-lg); font-style: italic; font-weight: 300; color: rgba(250,247,242,0.9);">Your home away from home.</p>
          <p style="margin-top: 4px; font-size: var(--fs-sm); color: rgba(250,247,242,0.55);">Luxury hospitality in the heart of the Maldives.</p>
        </div>
      </div>

      <!-- Right: form -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; background: var(--bg);">
        <div style="width: 100%; max-width: 380px; width: 100%;">
          <h1 style="font-family: var(--font-display); font-size: 36px; font-weight: 300; letter-spacing: -0.02em; color: var(--fg); margin: 0;">{{ msg.loginTitle }}</h1>
          <p style="margin-top: 6px; font-size: var(--fs-sm); color: var(--fg-3);">Use your Grand Plaza credentials</p>

          <form style="margin-top: 32px; display: flex; flex-direction: column; gap: 20px;" [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (form.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            <mat-checkbox formControlName="remember">Stay signed in</mat-checkbox>
            @if (error()) {
              <p style="border-radius: var(--r-md); background: var(--clay-100); padding: 10px 14px; font-size: var(--fs-sm); color: var(--clay-700); margin: 0;" role="alert">
                {{ error() }}
              </p>
            }
            <app-button variant="primary" class="w-full" [loading]="loading()" type="submit">
              Sign in
            </app-button>
          </form>

          <p style="margin-top: 24px; text-align: center; font-size: var(--fs-sm); color: var(--fg-3);">
            <a routerLink="/forgot-password" style="font-weight: 500; color: var(--fg); text-underline-offset: 3px;" onmouseenter="this.style.textDecoration='underline'" onmouseleave="this.style.textDecoration='none'">Forgot password?</a>
            <span style="margin: 0 8px; color: var(--sand-300);">·</span>
            <a routerLink="/register" style="font-weight: 500; color: var(--fg); text-underline-offset: 3px;" onmouseenter="this.style.textDecoration='underline'" onmouseleave="this.style.textDecoration='none'">Create account</a>
          </p>
        </div>
      </div>
    </div>
    <style>
      @media (min-width: 1024px) { .login-hero { display: block !important; } }
    </style>

    <!-- Demo user selector — non-production only, credentials not present in prod bundle -->
    @if (isDemo) {
      <div class="fixed bottom-6 right-6 z-50">
        @if (demoOpen()) {
          <!-- Click-away backdrop -->
          <div
            class="fixed inset-0"
            style="z-index: 49;"
            (click)="demoOpen.set(false)"
            aria-hidden="true"
          ></div>

          <!-- Panel -->
          <div
            class="absolute bottom-full right-0 mb-3 w-64 overflow-hidden"
            style="border-radius: var(--r-lg); border: 1px solid var(--border); background: var(--surface); box-shadow: var(--shadow-xl); z-index: 50;"
            role="dialog"
            aria-modal="true"
            aria-label="Select a demo account"
          >
            <div class="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span class="text-[11px] font-bold uppercase tracking-widest text-[var(--fg-3)]">
                Demo accounts
              </span>
              <button
                type="button"
                (click)="demoOpen.set(false)"
                class="rounded-md p-0.5 text-[var(--fg-3)] transition hover:bg-[var(--sand-100)] hover:text-[var(--fg-2)]"
                aria-label="Close demo panel"
              >
                <span class="material-icons-outlined text-[18px]" aria-hidden="true">close</span>
              </button>
            </div>

            <div class="py-1" role="list">
              @for (u of demoUsers; track u.email) {
                <button
                  type="button"
                  (click)="fillDemo(u)"
                  class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--sand-100)] active:bg-[var(--sand-200)]"
                  role="listitem"
                  [attr.aria-label]="'Sign in as ' + u.name + ' (' + u.role + ')'"
                >
                  <span
                    class="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    [ngClass]="roleBadgeClass(u.role)"
                  >{{ u.role }}</span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-[var(--fg)]">{{ u.name }}</p>
                    <p class="truncate text-[11px] text-[var(--fg-3)]">{{ u.email }}</p>
                  </div>
                </button>
              }
            </div>
          </div>
        }

        <!-- Trigger button -->
        <button
          type="button"
          (click)="demoOpen.update(v => !v)"
          [attr.aria-expanded]="demoOpen()"
          aria-haspopup="dialog"
          class="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--fg-3)] shadow-md transition hover:border-[var(--border-strong)] hover:bg-[var(--sand-100)] hover:text-[var(--fg)]"
        >
          <span class="material-icons-outlined text-[16px] text-[var(--fg-3)]" aria-hidden="true">science</span>
          Demo users
        </button>
      </div>
    }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly msg = MSG.auth;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly demoOpen = signal(false);

  // Credentials come from environment.ts only — absent in environment.prod.ts
  readonly isDemo = !environment.production;
  readonly demoUsers: DemoUser[] = environment.demoUsers;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  @HostListener('document:keydown.escape')
  closeDemoPanel(): void {
    this.demoOpen.set(false);
  }

  fillDemo(user: DemoUser): void {
    this.form.patchValue({ email: user.email, password: user.password });
    this.error.set(null);
    this.demoOpen.set(false);
  }

  roleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      Admin:   'badge badge-danger',
      Manager: 'badge badge-warning',
      Staff:   'badge badge-info',
      Guest:   'badge badge-success',
    };
    return map[role] ?? 'badge badge-neutral';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!isUserRole(res.role)) return;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl && returnUrl.startsWith('/')) {
          void this.router.navigateByUrl(returnUrl);
        } else {
          this.auth.navigateAfterLogin(res.role as UserRole);
        }
      },
      error: (err: { status?: number; error?: unknown }) => {
        this.loading.set(false);
        const body =
          typeof err.error === 'string'
            ? err.error
            : 'Unable to sign in. Check your email and password.';
        this.error.set(body);
      },
    });
  }
}
