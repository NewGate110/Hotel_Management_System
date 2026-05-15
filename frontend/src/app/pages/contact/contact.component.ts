import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppCardComponent } from '../../shared/ui/app-card/app-card.component';
import { AppButtonComponent } from '../../shared/ui/app-button/app-button.component';
import { ContactApiService } from '../../core/services/contact-api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AppCardComponent,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="max-width: 680px; margin: 0 auto; padding: 64px 24px;">

      <!-- Header -->
      <div style="margin-bottom: 40px; padding-bottom: 28px; border-bottom: 1px solid var(--border);">
        <p class="eyebrow">Grand Plaza Hotel</p>
        <h1 style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 12px;">Contact us</h1>
        <p style="font-size: var(--fs-sm); color: var(--fg-2); line-height: var(--lh-relaxed);">
          For reservations, partnership enquiries, and group bookings — our concierge team typically responds within 24 hours.
        </p>
      </div>

      <!-- Info strip -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 36px;" class="contact-info-grid">
        <div style="display: flex; flex-direction: column; gap: 10px; border-radius: var(--r-lg); border: 1px solid var(--border); background: var(--surface); padding: 16px 18px;">
          <span class="material-icons-outlined" style="font-size: 20px; color: var(--brand); flex-shrink: 0;">phone</span>
          <div style="min-width: 0;">
            <p style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg-3); margin: 0 0 4px;">Phone</p>
            <p style="font-size: var(--fs-sm); font-weight: 500; color: var(--fg); margin: 0; word-break: break-word;">+44 20 7946 0958</p>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; border-radius: var(--r-lg); border: 1px solid var(--border); background: var(--surface); padding: 16px 18px;">
          <span class="material-icons-outlined" style="font-size: 20px; color: var(--brand); flex-shrink: 0;">email</span>
          <div style="min-width: 0;">
            <p style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg-3); margin: 0 0 4px;">Email</p>
            <p style="font-size: var(--fs-sm); font-weight: 500; color: var(--fg); margin: 0; word-break: break-all;">concierge&#64;grandplaza.com</p>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; border-radius: var(--r-lg); border: 1px solid var(--border); background: var(--surface); padding: 16px 18px;">
          <span class="material-icons-outlined" style="font-size: 20px; color: var(--brand); flex-shrink: 0;">schedule</span>
          <div style="min-width: 0;">
            <p style="font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg-3); margin: 0 0 4px;">Hours</p>
            <p style="font-size: var(--fs-sm); font-weight: 500; color: var(--fg); margin: 0;">24 / 7</p>
          </div>
        </div>
      </div>

      <!-- Submitted states -->
      @if (submitted()) {
        @if (sendError()) {
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; border-radius: var(--r-lg); border: 1px solid var(--clay-300); background: var(--clay-100); padding: 48px 32px; text-align: center;">
            <span class="material-icons-outlined" style="font-size: 48px; color: var(--clay-500);">schedule</span>
            <h2 style="font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 400; color: var(--clay-700); margin: 0;">Message queued</h2>
            <p style="font-size: var(--fs-sm); color: var(--clay-700); margin: 0; max-width: 400px;">Thank you, <strong>{{ submittedName() }}</strong>. Message delivery is pending — please reach us by phone or email for now.</p>
            <button type="button" style="font-size: var(--fs-sm); font-weight: 500; color: var(--clay-700); text-decoration: underline; text-underline-offset: 3px; background: none; border: none; cursor: pointer;" (click)="reset()">
              Send another message
            </button>
          </div>
        } @else {
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; border-radius: var(--r-lg); border: 1px solid var(--glass-300); background: var(--glass-100); padding: 48px 32px; text-align: center;">
            <span class="material-icons-outlined" style="font-size: 48px; color: var(--glass-500);">check_circle</span>
            <h2 style="font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 400; color: var(--glass-700); margin: 0;">Message received</h2>
            <p style="font-size: var(--fs-sm); color: var(--glass-700); margin: 0; max-width: 400px;">Thank you, <strong>{{ submittedName() }}</strong>. Our concierge team will be in touch shortly.</p>
            <button type="button" style="font-size: var(--fs-sm); font-weight: 500; color: var(--glass-700); text-decoration: underline; text-underline-offset: 3px; background: none; border: none; cursor: pointer;" (click)="reset()">
              Send another message
            </button>
          </div>
        }
      } @else {
        <!-- Form -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 28px;">
          <h2 style="font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 400; color: var(--fg); margin: 0 0 24px; letter-spacing: -0.01em;">Send a message</h2>
          <form style="display: flex; flex-direction: column; gap: 16px;" [formGroup]="form" (ngSubmit)="submit()">
            <div class="grid gap-4 sm:grid-cols-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Full name</mat-label>
                <input matInput formControlName="name" autocomplete="name" />
                @if (form.controls.name.invalid && form.controls.name.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email address</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email" />
                @if (form.controls.email.hasError('required') && form.controls.email.touched) {
                  <mat-error>Email is required</mat-error>
                } @else if (form.controls.email.hasError('email') && form.controls.email.touched) {
                  <mat-error>Enter a valid email address</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Subject</mat-label>
              <mat-select formControlName="subject">
                <mat-option value="reservation">Reservation enquiry</mat-option>
                <mat-option value="group">Group / corporate booking</mat-option>
                <mat-option value="partnership">Partnership</mat-option>
                <mat-option value="feedback">Feedback</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
              @if (form.controls.subject.invalid && form.controls.subject.touched) {
                <mat-error>Please select a subject</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Message</mat-label>
              <textarea matInput rows="5" formControlName="message" placeholder="Tell us how we can help…"></textarea>
              @if (form.controls.message.invalid && form.controls.message.touched) {
                <mat-error>Message is required</mat-error>
              }
            </mat-form-field>
            <div style="display: flex; justify-content: flex-end; padding-top: 4px;">
              <app-button variant="primary" type="submit" [loading]="sending()" [disabled]="form.invalid">
                Send message
              </app-button>
            </div>
          </form>
        </div>
      }
    </div>

    <style>
      @media (max-width: 540px) { .contact-info-grid { grid-template-columns: 1fr !important; } }
    </style>
  `,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactApi = inject(ContactApiService);

  readonly sending = signal(false);
  readonly submitted = signal(false);
  readonly submittedName = signal('');
  readonly sendError = signal(false);

  readonly form = this.fb.nonNullable.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.sending.set(true);
    const v = this.form.getRawValue();
    this.contactApi.send(v).subscribe({
      next: () => {
        this.submittedName.set(v.name);
        this.sending.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.sending.set(false);
        this.submittedName.set(v.name);
        this.sendError.set(true);
        this.submitted.set(true);
      },
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.sendError.set(false);
    this.form.reset();
  }
}
