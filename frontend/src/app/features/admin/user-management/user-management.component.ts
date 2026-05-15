import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit,
  inject, signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { CreateStaffDto, GuestListDto, StaffUserDto, UpdateStaffDto } from '../../../core/models/user.models';
import { AppTableComponent } from '../../../shared/ui/app-table/app-table.component';
import { AppPaginationComponent } from '../../../shared/ui/app-pagination/app-pagination.component';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';
import { AppLoaderComponent } from '../../../shared/ui/app-loader/app-loader.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppButtonComponent } from '../../../shared/ui/app-button/app-button.component';

// ── Create / Edit Staff Dialog ────────────────────────────────────────────────

export interface StaffDialogData {
  mode: 'create' | 'edit';
  staff?: StaffUserDto;
}

@Component({
  selector: 'app-staff-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create staff account' : 'Edit staff account' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-2 gap-4 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>First name</mat-label>
          <input matInput formControlName="firstName" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Last name</mat-label>
          <input matInput formControlName="lastName" />
        </mat-form-field>
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="off" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="col-span-2">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
            <mat-hint>Min 8 chars, upper/lower/number/special</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Employee ID</mat-label>
            <input matInput formControlName="employeeId" />
          </mat-form-field>
        }
        <mat-form-field appearance="outline" [class.col-span-2]="data.mode === 'edit'">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" />
        </mat-form-field>
        <mat-form-field appearance="outline" [class.col-span-2]="data.mode === 'edit'">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="FrontDeskStaff">Front Desk Staff</mat-option>
            <mat-option value="HotelManager">Hotel Manager</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class StaffDialogComponent {
  readonly data = inject<StaffDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<StaffDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    firstName:  [this.data.staff?.firstName  ?? '', Validators.required],
    lastName:   [this.data.staff?.lastName   ?? '', Validators.required],
    email:      [this.data.staff?.email      ?? '', this.data.mode === 'create' ? [Validators.required, Validators.email] : []],
    password:   ['',                                this.data.mode === 'create' ? Validators.required : []],
    employeeId: [this.data.staff?.employeeId ?? '', this.data.mode === 'create' ? Validators.required : []],
    department: [this.data.staff?.department ?? '', Validators.required],
    role:       [this.data.staff?.role       ?? 'FrontDeskStaff', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.dialogRef.close({ mode: 'create', ...v } as CreateStaffDto);
    } else {
      this.dialogRef.close({
        mode: 'edit',
        firstName: v.firstName,
        lastName: v.lastName,
        department: v.department,
        role: v.role,
      } as UpdateStaffDto & { mode: 'edit' });
    }
  }
}

// ── User Management Page ──────────────────────────────────────────────────────

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    AppTableComponent,
    AppPaginationComponent,
    AppBadgeComponent,
    AppLoaderComponent,
    AppEmptyStateComponent,
    AppButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display: flex; flex-direction: column; gap: 28px;">

      <!-- Page header -->
      <div style="display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 24px; border-bottom: 1px solid var(--border);">
        <div>
          <p class="eyebrow">Administration</p>
          <h1 style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: 300; letter-spacing: var(--ls-tight); color: var(--fg); margin: 8px 0 0;">User management</h1>
        </div>
        <app-button variant="primary" type="button" (click)="openCreateDialog()">
          <span class="material-icons-outlined" style="font-size: 16px;">add</span>
          Create staff
        </app-button>
      </div>

      <mat-tab-group (selectedIndexChange)="onTabChange($event)">

        <!-- ── Staff Tab ────────────────────────────────────────────────── -->
        <mat-tab label="Staff">
          @if (staffLoading()) {
            <div class="pt-6"><app-loader caption="Loading staff…" /></div>
          } @else if (staffError()) {
            <app-empty-state icon="error_outline" title="Could not load staff" [hint]="staffError()!" />
          } @else if (allStaff().length === 0) {
            <app-empty-state icon="badge" title="No staff accounts" hint="Use 'Create staff' to add the first account." />
          } @else {
            <app-table class="mt-4 block">
              <table mat-table [dataSource]="pagedStaff()" class="w-full">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let u">
                    <span style="display: inline-flex; align-items: center; gap: 8px;">
                      {{ u.firstName }} {{ u.lastName }}
                      @if (!u.isActive) {
                        <app-badge tone="danger" [dot]="true">Deactivated</app-badge>
                      }
                      @if (u.isLocked) {
                        <app-badge tone="warning" [dot]="true">Locked</app-badge>
                      }
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let u" style="font-size: 13px; color: var(--fg-2);">{{ u.email }}</td>
                </ng-container>
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let u">
                    <app-badge tone="info">{{ u.role }}</app-badge>
                  </td>
                </ng-container>
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Dept</th>
                  <td mat-cell *matCellDef="let u" style="color: var(--fg-2); font-size: 13px;">{{ u.department }}</td>
                </ng-container>
                <ng-container matColumnDef="employeeId">
                  <th mat-header-cell *matHeaderCellDef>Emp ID</th>
                  <td mat-cell *matCellDef="let u" style="font-family: var(--font-mono); font-size: 12px; color: var(--fg-2);">{{ u.employeeId }}</td>
                </ng-container>
                <ng-container matColumnDef="media">
                  <th mat-header-cell *matHeaderCellDef>Media</th>
                  <td mat-cell *matCellDef="let u" style="white-space: nowrap;">
                    @if (u.role === 'FrontDeskStaff' || u.role === 'HotelManager') {
                      <button
                        type="button"
                        [class]="u.canManageMedia ? 'action-btn action-btn--success' : 'action-btn action-btn--warn'"
                        [matTooltip]="u.canManageMedia ? 'Revoke media access' : 'Grant media access'"
                        [disabled]="togglingMedia() === u.id"
                        (click)="toggleMediaPermission(u)"
                        style="width: auto; padding: 0 8px; gap: 4px;"
                      >
                        <span class="material-icons-outlined" style="font-size: 15px;">
                          {{ u.canManageMedia ? 'photo_library' : 'no_photography' }}
                        </span>
                        <span style="font-size: 12px;">{{ u.canManageMedia ? 'On' : 'Off' }}</span>
                      </button>
                    }
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let u" style="white-space: nowrap; text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 4px;">
                      <!-- Edit -->
                      <button type="button" class="action-btn" matTooltip="Edit" (click)="openEditDialog(u)">
                        <span class="material-icons-outlined" style="font-size: 15px;">edit</span>
                      </button>
                      <!-- Unlock -->
                      @if (u.isLocked) {
                        <button type="button" class="action-btn action-btn--warn" matTooltip="Unlock account" (click)="unlock(u.id)">
                          <span class="material-icons-outlined" style="font-size: 15px;">lock_open</span>
                        </button>
                      }
                      <!-- Deactivate / Reactivate -->
                      <button type="button"
                        [class]="u.isActive ? 'action-btn action-btn--danger' : 'action-btn action-btn--success'"
                        [matTooltip]="u.isActive ? 'Deactivate account' : 'Reactivate account'"
                        (click)="toggleActive(u)">
                        <span class="material-icons-outlined" style="font-size: 15px;">{{ u.isActive ? 'person_off' : 'person_add' }}</span>
                      </button>
                      <!-- Force password change -->
                      <button type="button" class="action-btn action-btn--accent" matTooltip="Force password change on next login" (click)="forcePasswordChange(u.id)">
                        <span class="material-icons-outlined" style="font-size: 15px;">key</span>
                      </button>
                    </div>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="staffCols"></tr>
                <tr mat-row *matRowDef="let row; columns: staffCols"></tr>
              </table>
            </app-table>
            <app-pagination
              [length]="allStaff().length"
              [pageSize]="staffPageSize()"
              [pageIndex]="staffPageIndex()"
              (pageChange)="onStaffPage($event)"
            />
          }
        </mat-tab>

        <!-- ── Guests Tab ───────────────────────────────────────────────── -->
        <mat-tab label="Guests">
          @if (guestLoading()) {
            <div class="pt-6"><app-loader caption="Loading guests…" /></div>
          } @else if (guestError()) {
            <app-empty-state icon="error_outline" title="Could not load guests" [hint]="guestError()!" />
          } @else if (allGuests().length === 0) {
            <app-empty-state icon="people_outline" title="No guest accounts" hint="Guests appear here after they register." />
          } @else {
            <app-table class="mt-4 block">
              <table mat-table [dataSource]="pagedGuests()" class="w-full">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let g">
                    <span style="display: inline-flex; align-items: center; gap: 8px;">
                      {{ g.fullName }}
                      @if (!g.isActive) {
                        <app-badge tone="danger" [dot]="true">Deactivated</app-badge>
                      }
                      @if (g.isLocked) {
                        <app-badge tone="warning" [dot]="true">Locked</app-badge>
                      }
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let g" style="font-size: 13px; color: var(--fg-2);">{{ g.email }}</td>
                </ng-container>
                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef>Phone</th>
                  <td mat-cell *matCellDef="let g" style="font-size: 13px; color: var(--fg-2);">{{ g.phone || '—' }}</td>
                </ng-container>
                <ng-container matColumnDef="bookings">
                  <th mat-header-cell *matHeaderCellDef>Bookings</th>
                  <td mat-cell *matCellDef="let g">{{ g.totalBookings }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let g" style="white-space: nowrap; text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 4px;">
                      @if (g.isLocked) {
                        <button type="button" class="action-btn action-btn--warn" matTooltip="Unlock account" (click)="unlock(g.id)">
                          <span class="material-icons-outlined" style="font-size: 15px;">lock_open</span>
                        </button>
                      }
                      <button type="button"
                        [class]="g.isActive ? 'action-btn action-btn--danger' : 'action-btn action-btn--success'"
                        [matTooltip]="g.isActive ? 'Deactivate account' : 'Reactivate account'"
                        (click)="toggleGuestActive(g)">
                        <span class="material-icons-outlined" style="font-size: 15px;">{{ g.isActive ? 'person_off' : 'person_add' }}</span>
                      </button>
                    </div>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="guestCols"></tr>
                <tr mat-row *matRowDef="let row; columns: guestCols"></tr>
              </table>
            </app-table>
            <app-pagination
              [length]="allGuests().length"
              [pageSize]="guestPageSize()"
              [pageIndex]="guestPageIndex()"
              (pageChange)="onGuestPage($event)"
            />
          }
        </mat-tab>

      </mat-tab-group>
    </div>

    <style>
      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: var(--r-sm);
        border: 1px solid transparent;
        background: transparent;
        color: var(--fg-2);
        cursor: pointer;
        transition: background var(--dur-fast) var(--ease-out),
                    color var(--dur-fast) var(--ease-out),
                    border-color var(--dur-fast) var(--ease-out);
      }
      .action-btn:hover {
        background: var(--sand-100);
        border-color: var(--border);
        color: var(--fg);
      }
      /* Deactivate — clay/danger */
      .action-btn--danger { color: #A8412E; }
      .action-btn--danger:hover { background: #FBEDEA; border-color: #F5C6BB; color: #A8412E; }
      /* Reactivate — seaglass/success */
      .action-btn--success { color: var(--glass-700, #2E6655); }
      .action-btn--success:hover { background: var(--glass-100, #EAF4F0); border-color: var(--glass-300, #A8D5C5); color: var(--glass-700, #2E6655); }
      /* Unlock — clay/warning */
      .action-btn--warn { color: var(--clay-700, #7A3B1E); }
      .action-btn--warn:hover { background: var(--clay-100, #F9EDE5); border-color: var(--clay-300, #E8C4A8); color: var(--clay-700, #7A3B1E); }
      /* Force password — azure/brand */
      .action-btn--accent { color: var(--brand); }
      .action-btn--accent:hover { background: var(--azure-100); border-color: var(--azure-200); color: var(--brand); }
    </style>
  `,
})
export class UserManagementComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly dialog   = inject(MatDialog);
  private readonly snack    = inject(MatSnackBar);
  private readonly cdr      = inject(ChangeDetectorRef);

  // ── Staff state ────────────────────────────────────────────────────────────
  readonly staffCols = ['name', 'email', 'role', 'department', 'employeeId', 'media', 'actions'];
  readonly staffPageSize  = signal(10);
  readonly staffPageIndex = signal(0);
  readonly allStaff   = signal<StaffUserDto[]>([]);
  readonly pagedStaff = signal<StaffUserDto[]>([]);
  readonly staffLoading = signal(true);
  readonly staffError   = signal<string | null>(null);

  // ── Guest state ────────────────────────────────────────────────────────────
  readonly guestCols = ['name', 'email', 'phone', 'bookings', 'actions'];
  readonly guestPageSize  = signal(10);
  readonly guestPageIndex = signal(0);
  readonly allGuests   = signal<GuestListDto[]>([]);
  readonly pagedGuests = signal<GuestListDto[]>([]);
  readonly guestLoading = signal(false);
  readonly guestError   = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStaff();
  }

  onTabChange(index: number): void {
    if (index === 1 && this.allGuests().length === 0 && !this.guestLoading()) {
      this.loadGuests();
    }
  }

  // ── Loaders ────────────────────────────────────────────────────────────────

  private loadStaff(): void {
    this.staffLoading.set(true);
    this.adminApi.getStaff().subscribe({
      next:  (s) => { this.allStaff.set(s); this.applyStaffPage(); this.staffLoading.set(false); },
      error: (e) => { this.staffError.set((e as Error)?.message ?? 'Failed to load staff'); this.staffLoading.set(false); },
    });
  }

  private loadGuests(): void {
    this.guestLoading.set(true);
    this.adminApi.getGuests().subscribe({
      next:  (g) => { this.allGuests.set(g); this.applyGuestPage(); this.guestLoading.set(false); },
      error: (e) => { this.guestError.set((e as Error)?.message ?? 'Failed to load guests'); this.guestLoading.set(false); },
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  private applyStaffPage(): void {
    const s = this.staffPageIndex() * this.staffPageSize();
    this.pagedStaff.set(this.allStaff().slice(s, s + this.staffPageSize()));
  }

  private applyGuestPage(): void {
    const s = this.guestPageIndex() * this.guestPageSize();
    this.pagedGuests.set(this.allGuests().slice(s, s + this.guestPageSize()));
  }

  onStaffPage(ev: { pageIndex: number; pageSize: number }): void {
    this.staffPageIndex.set(ev.pageIndex); this.staffPageSize.set(ev.pageSize); this.applyStaffPage();
  }

  onGuestPage(ev: { pageIndex: number; pageSize: number }): void {
    this.guestPageIndex.set(ev.pageIndex); this.guestPageSize.set(ev.pageSize); this.applyGuestPage();
  }

  // ── Staff CRUD ─────────────────────────────────────────────────────────────

  openCreateDialog(): void {
    const ref = this.dialog.open(StaffDialogComponent, { width: '560px', data: { mode: 'create' } as StaffDialogData });
    ref.afterClosed().subscribe((result: (CreateStaffDto & { mode: 'create' }) | undefined) => {
      if (!result) return;
      const { mode: _, ...dto } = result;
      this.adminApi.createStaff(dto as CreateStaffDto).subscribe({
        next: (s) => { this.allStaff.update(arr => [s, ...arr]); this.applyStaffPage(); this.snack.open('Staff account created.', 'OK', { duration: 4000 }); },
        error: () => this.snack.open('Failed to create account.', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  openEditDialog(staff: StaffUserDto): void {
    const ref = this.dialog.open(StaffDialogComponent, { width: '560px', data: { mode: 'edit', staff } as StaffDialogData });
    ref.afterClosed().subscribe((result: (UpdateStaffDto & { mode: 'edit' }) | undefined) => {
      if (!result) return;
      const { mode: _, ...dto } = result;
      this.adminApi.updateStaff(staff.id, dto as UpdateStaffDto).subscribe({
        next: (updated) => {
          this.allStaff.update(arr => arr.map(s => s.id === updated.id ? updated : s));
          this.applyStaffPage();
          this.snack.open('Staff account updated.', 'OK', { duration: 4000 });
        },
        error: () => this.snack.open('Failed to update account.', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  toggleActive(staff: StaffUserDto): void {
    const action = staff.isActive ? this.adminApi.deactivateUser(staff.id) : this.adminApi.reactivateUser(staff.id);
    action.subscribe({
      next: () => {
        this.allStaff.update(arr => arr.map(s => s.id === staff.id ? { ...s, isActive: !s.isActive } : s));
        this.applyStaffPage();
        this.snack.open(staff.isActive ? 'Account deactivated.' : 'Account reactivated.', 'OK', { duration: 4000 });
      },
      error: () => this.snack.open('Action failed.', 'Dismiss', { duration: 4000 }),
    });
  }

  toggleGuestActive(guest: GuestListDto): void {
    const action = guest.isActive ? this.adminApi.deactivateUser(guest.id) : this.adminApi.reactivateUser(guest.id);
    action.subscribe({
      next: () => {
        this.allGuests.update(arr => arr.map(g => g.id === guest.id ? { ...g, isActive: !g.isActive } : g));
        this.applyGuestPage();
        this.snack.open(guest.isActive ? 'Account deactivated.' : 'Account reactivated.', 'OK', { duration: 4000 });
      },
      error: () => this.snack.open('Action failed.', 'Dismiss', { duration: 4000 }),
    });
  }

  unlock(id: number): void {
    this.adminApi.unlockAccount(id).subscribe({
      next: () => {
        this.allStaff.update(arr => arr.map(s => s.id === id ? { ...s, isLocked: false } : s));
        this.allGuests.update(arr => arr.map(g => g.id === id ? { ...g, isLocked: false } : g));
        this.applyStaffPage(); this.applyGuestPage();
        this.snack.open('Account unlocked.', 'OK', { duration: 4000 });
      },
      error: () => this.snack.open('Failed to unlock.', 'Dismiss', { duration: 4000 }),
    });
  }

  forcePasswordChange(id: number): void {
    this.adminApi.forcePasswordChange(id).subscribe({
      next: () => this.snack.open('User will be prompted to change password on next login.', 'OK', { duration: 5000 }),
      error: () => this.snack.open('Action failed.', 'Dismiss', { duration: 4000 }),
    });
  }

  // ── Media permission ───────────────────────────────────────────────────────

  readonly togglingMedia = signal<number | null>(null);

  toggleMediaPermission(staff: StaffUserDto): void {
    this.togglingMedia.set(staff.id);
    const newValue = !staff.canManageMedia;
    this.adminApi.updateMediaPermission(staff.id, newValue).subscribe({
      next: (updated) => {
        this.allStaff.update(list => list.map(s => s.id === updated.id ? updated : s));
        this.applyStaffPage();
        this.snack.open(
          newValue
            ? `Media access granted to ${updated.firstName} ${updated.lastName}.`
            : `Media access revoked from ${updated.firstName} ${updated.lastName}.`,
          'OK',
          { duration: 4000 },
        );
        this.togglingMedia.set(null);
      },
      error: () => {
        this.snack.open('Failed to update media permission.', 'Dismiss', { duration: 4000 });
        this.togglingMedia.set(null);
      },
    });
  }
}
