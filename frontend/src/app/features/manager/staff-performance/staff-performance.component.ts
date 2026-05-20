// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UsersApiService } from '../../../core/services/users-api.service';
import { ReportsApiService } from '../../../core/services/reports-api.service';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { StaffUserDto } from '../../../core/models/user.models';
import type { StaffPerformanceDto } from '../../../core/models/report.models';
import type { HotelSummaryDto } from '../../../core/models/hotel.models';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { AppCardComponent } from '../../../shared/ui/app-card/app-card.component';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';

@Component({
  selector: 'app-staff-performance',
  standalone: true,
  imports: [
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    AppStatCardComponent,
    AppCardComponent,
    AppLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .avatar {
      width: 32px; height: 32px; flex-shrink: 0;
      border-radius: var(--r-pill);
      background: var(--azure-100); color: var(--azure-700);
      font-size: 11px; font-weight: 700; font-family: var(--font-sans);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .activity-bar-bg {
      height: 6px; border-radius: var(--r-pill);
      background: var(--bg-alt); overflow: hidden;
    }
    .activity-bar-fill {
      height: 100%; border-radius: var(--r-pill);
      background: var(--azure-400);
      transition: width 0.4s ease;
    }
    td.mat-column-name { min-width: 180px; }
    td.mat-column-activity { min-width: 120px; }
  `],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="eyebrow mb-1">Hotel Manager</p>
          <h2 style="color: var(--fg)">Staff performance</h2>
        </div>
        @if (hotels().length > 1) {
          <mat-form-field appearance="outline" style="width: 220px">
            <mat-label>Hotel</mat-label>
            <mat-select [value]="selectedHotelId()" (valueChange)="selectHotel($event)">
              @for (h of hotels(); track h.id) {
                <mat-option [value]="h.id">{{ h.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <!-- KPI cards -->
      <div class="grid gap-4 sm:grid-cols-3">
        <app-stat-card label="Active staff"   [value]="activeStaff().toString()"   hint="On roster" />
        <app-stat-card label="Total check-ins" [value]="totalCheckIns().toString()" hint="All staff combined" />
        <app-stat-card label="CSAT"            value="N/A"                          hint="Not tracked in this system" />
      </div>

      <!-- Team table -->
      <app-card title="Team performance">
        @if (loading()) {
          <app-loader caption="Loading performance data…" />
        } @else if (tableData().length === 0) {
          <p class="py-6 text-center text-sm" style="color: var(--fg-3)">No staff data found.</p>
        } @else {
          <div style="overflow-x: auto">
            <table mat-table [dataSource]="tableData()" class="w-full">

              <!-- Name + avatar -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-3">
                    <span class="avatar">{{ initials(row.fullName) }}</span>
                    <span class="text-sm font-medium" style="color: var(--fg)">{{ row.fullName }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let row" class="text-sm" style="color: var(--fg-2)">{{ row.role }}</td>
              </ng-container>

              <ng-container matColumnDef="dept">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let row" class="text-sm" style="color: var(--fg-2)">{{ row.department || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef style="text-align: right">Bookings</th>
                <td mat-cell *matCellDef="let row" style="text-align: right">
                  <span class="text-sm font-semibold" style="font-family: var(--font-display); color: var(--fg)">
                    {{ row.bookingsCreated }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="checkins">
                <th mat-header-cell *matHeaderCellDef style="text-align: right">Check-ins</th>
                <td mat-cell *matCellDef="let row" style="text-align: right">
                  <span class="text-sm font-semibold" style="font-family: var(--font-display); color: var(--fg)">
                    {{ row.checkIns }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="checkouts">
                <th mat-header-cell *matHeaderCellDef style="text-align: right">Check-outs</th>
                <td mat-cell *matCellDef="let row" style="text-align: right">
                  <span class="text-sm font-semibold" style="font-family: var(--font-display); color: var(--fg)">
                    {{ row.checkOuts }}
                  </span>
                </td>
              </ng-container>

              <!-- Activity bar -->
              <ng-container matColumnDef="activity">
                <th mat-header-cell *matHeaderCellDef>Activity</th>
                <td mat-cell *matCellDef="let row">
                  <div class="activity-bar-bg" style="width: 80px">
                    <div class="activity-bar-fill"
                         [style.width]="activityPct(row) + '%'"></div>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols"></tr>
            </table>
          </div>
        }
      </app-card>

    </div>
  `,
})
export class StaffPerformanceComponent {
  private readonly usersApi   = inject(UsersApiService);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly hotelsApi  = inject(HotelsApiService);
  private readonly notify     = inject(NotificationService);

  readonly hotels          = signal<HotelSummaryDto[]>([]);
  readonly selectedHotelId = signal<number | null>(null);
  readonly staff           = signal<StaffUserDto[]>([]);
  readonly perfData        = signal<StaffPerformanceDto[]>([]);
  readonly loading         = signal(true);

  readonly cols = ['name', 'role', 'dept', 'created', 'checkins', 'checkouts', 'activity'];

  readonly activeStaff   = computed(() => this.staff().filter(s => s.isActive).length);
  readonly totalCheckIns = computed(() => this.perfData().reduce((acc, r) => acc + r.checkIns, 0));

  readonly maxActivity = computed(() =>
    Math.max(1, ...this.perfData().map(r => r.bookingsCreated + r.checkIns + r.checkOuts))
  );

  readonly tableData = computed<StaffPerformanceDto[]>(() => {
    if (this.perfData().length > 0) return this.perfData();
    return this.staff().map(s => ({
      staffId:         s.id,
      fullName:        `${s.firstName} ${s.lastName}`,
      department:      s.department,
      role:            s.role,
      bookingsCreated: 0,
      checkIns:        0,
      checkOuts:       0,
    }));
  });

  constructor() {
    this.usersApi.getAllStaff().subscribe({
      next: (s) => this.staff.set(s),
      error: () => {},
    });

    this.hotelsApi.getAll().subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        if (hotels.length) {
          this.selectedHotelId.set(hotels[0]!.id);
          this.loadPerformance(hotels[0]!.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load hotels.'); },
    });
  }

  selectHotel(id: number): void {
    this.selectedHotelId.set(id);
    this.loadPerformance(id);
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  activityPct(row: StaffPerformanceDto): number {
    const total = row.bookingsCreated + row.checkIns + row.checkOuts;
    return Math.round((total / this.maxActivity()) * 100);
  }

  private loadPerformance(hotelId: number): void {
    this.loading.set(true);
    this.reportsApi.getStaffPerformance(hotelId).subscribe({
      next:  (data) => { this.perfData.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); this.notify.error('Failed to load performance data.'); },
    });
  }
}
