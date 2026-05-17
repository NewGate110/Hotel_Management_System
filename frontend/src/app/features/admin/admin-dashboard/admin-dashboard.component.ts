import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, AppStatCardComponent, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <!-- Page heading -->
      <div>
        <p class="eyebrow">Administration</p>
        <h1 style="font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 0;">
          System overview
        </h1>
      </div>

      <!-- KPI grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;" class="kpi-grid">
        <app-stat-card label="Hotels" [value]="hotels().toString()" hint="Managed properties" />
        <app-stat-card label="Staff accounts" [value]="staff().toString()" hint="Active staff users" />
        <app-stat-card label="Audit events (24h)" [value]="auditEvents24h().toString()" hint="Last 24 hours" />
      </div>

      <!-- Shortcuts -->
      <div class="card-surface" style="padding: 24px 28px;">
        <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 400; color: var(--fg); margin: 0 0 20px; letter-spacing: -0.01em;">Quick navigation</h2>
        <div class="rule" style="margin-bottom: 20px;"></div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <a routerLink="/app/admin/users" style="text-decoration: none;">
            <app-button variant="secondary" type="button">
              <span class="material-icons-outlined" style="font-size: 16px;">people</span>
              Users
            </app-button>
          </a>
          <a routerLink="/app/admin/config" style="text-decoration: none;">
            <app-button variant="secondary" type="button">
              <span class="material-icons-outlined" style="font-size: 16px;">settings</span>
              Configuration
            </app-button>
          </a>
          <a routerLink="/app/admin/audit" style="text-decoration: none;">
            <app-button variant="secondary" type="button">
              <span class="material-icons-outlined" style="font-size: 16px;">history</span>
              Audit logs
            </app-button>
          </a>
        </div>
      </div>
    </div>

    <style>
      @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr !important; } }
    </style>
  `,
})
export class AdminDashboardComponent {
  private readonly adminApi = inject(AdminApiService);

  readonly hotels = signal(0);
  readonly staff = signal(0);
  readonly auditEvents24h = signal(0);

  constructor() {
    this.adminApi.getHotels().subscribe((h) => this.hotels.set(h.length));
    this.adminApi.getStaff().subscribe((s) => this.staff.set(s.length));
    const cutoff = new Date(Date.now() - 86_400_000);
    this.adminApi.getAuditLogs().subscribe((logs) =>
      this.auditEvents24h.set(logs.filter((l) => new Date(l.timestamp) >= cutoff).length),
    );
  }
}
