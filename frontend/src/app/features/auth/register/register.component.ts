// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/auth/auth.service';
import type { UserRole } from '../../../core/constants/roles';
import { isUserRole } from '../../../core/constants/roles';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';
import { MSG } from '../../../core/i18n/ui-messages';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; min-height: calc(100vh - 68px);">
      <!-- Left: hero image -->
      <div style="position: relative; flex: 1; display: none;" class="register-hero">
        <img
          src="https://images.unsplash.com/photo-1574223706388-0e0f6f0390b2?h=1200&w=800&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          style="height: 100%; width: 100%; object-fit: cover;"
        />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,36,48,0.25) 0%, rgba(14,36,48,0.05) 40%, rgba(14,36,48,0.75) 100%);"></div>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 48px;">
          <img src="/logo.png" alt="Grand Plaza" style="margin-bottom: 24px; height: 48px; width: auto; object-fit: contain; object-position: left; filter: invert(0.92) brightness(1.1);" />
          <p style="font-family: var(--font-display); font-size: var(--fs-lg); font-style: italic; font-weight: 300; color: rgba(250,247,242,0.9);">Begin your Grand Plaza journey.</p>
          <p style="margin-top: 4px; font-size: var(--fs-sm); color: rgba(250,247,242,0.55);">Create an account to manage your stays and rewards.</p>
        </div>
      </div>

      <!-- Right: form -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; background: var(--bg);">
        <div style="width: 100%; max-width: 440px;">
          <h1 style="font-family: var(--font-display); font-size: 36px; font-weight: 300; letter-spacing: -0.02em; color: var(--fg); margin: 0;">{{ msg.registerTitle }}</h1>

          <form style="margin-top: 32px; display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));" [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="w-full" style="grid-column: 1 / -1;">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Enter a valid email address</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full" style="grid-column: 1 / -1;">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              @if (form.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              } @else if (form.controls.password.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>First name</mat-label>
              <input matInput formControlName="firstName" autocomplete="given-name" />
              @if (form.controls.firstName.hasError('required')) {
                <mat-error>First name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last name</mat-label>
              <input matInput formControlName="lastName" autocomplete="family-name" />
              @if (form.controls.lastName.hasError('required')) {
                <mat-error>Last name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full" style="grid-column: 1 / -1;">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" autocomplete="tel" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full" style="grid-column: 1 / -1;">
              <mat-label>Address</mat-label>
              <textarea matInput rows="2" formControlName="address"></textarea>
            </mat-form-field>
            @if (error()) {
              <p style="grid-column: 1 / -1; border-radius: var(--r-md); background: var(--clay-100); padding: 10px 14px; font-size: var(--fs-sm); color: var(--clay-700); margin: 0;" role="alert">
                {{ error() }}
              </p>
            }
            <div style="grid-column: 1 / -1;">
              <app-button variant="primary" class="w-full" [loading]="loading()" type="submit">
                Create account
              </app-button>
            </div>
          </form>

          <p style="margin-top: 24px; text-align: center; font-size: var(--fs-sm); color: var(--fg-3);">
            Already registered?
            <a routerLink="/login" style="font-weight: 500; color: var(--fg); text-underline-offset: 3px;" onmouseenter="this.style.textDecoration='underline'" onmouseleave="this.style.textDecoration='none'">Sign in</a>
          </p>
        </div>
      </div>
    </div>
    <style>
      @media (min-width: 1024px) { .register-hero { display: block !important; } }
    </style>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly msg = MSG.auth;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.auth
      .register({
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        phone: v.phone || undefined,
        address: v.address || undefined,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!isUserRole(res.role)) return;
          void this.router.navigateByUrl('/app/guest/dashboard');
        },
        error: (err: { error?: unknown }) => {
          this.loading.set(false);
          const body = typeof err.error === 'string' ? err.error : 'Registration failed.';
          this.error.set(body);
        },
      });
  }
}
