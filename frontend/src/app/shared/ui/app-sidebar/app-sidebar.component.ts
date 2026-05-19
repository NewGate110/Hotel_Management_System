// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarNavItem {
  label: string;
  icon: string;
  link: readonly unknown[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="flex h-full flex-col"
      style="background: var(--sand-900); color: var(--sand-200);"
      [class.w-64]="!collapsed()"
      [class.w-[4.5rem]]="collapsed()"
    >
      <!-- Logo -->
      <div class="flex h-14 items-center px-4" style="border-bottom: 1px solid rgba(212,200,179,0.12);">
        <a href="/">
          @if (!collapsed()) {
            <img
              src="/logo-dark.png"
              alt="Grand Plaza"
              class="h-12 w-auto object-contain object-left"
              style="filter: invert(0.92) brightness(1.1);"
            />
          } @else {
            <img
              src="/logo-dark.png"
              alt="Grand Plaza"
              class="h-10 object-contain object-center"
              style="filter: invert(0.92) brightness(1.1);"
            />
          }
        </a>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-2" style="display: flex; flex-direction: column; gap: 2px;" aria-label="Primary">
        @for (item of items(); track item.link.join('/')) {
          <a
            class="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors"
            style="border-radius: var(--r-sm); color: var(--sand-300); text-decoration: none;"
            [routerLink]="item.link"
            routerLinkActive="sidebar-link-active"
            [routerLinkActiveOptions]="{ exact: item.link.length <= 1 }"
            (mouseenter)="onLinkHover($event, true)"
            (mouseleave)="onLinkHover($event, false)"
          >
            <span class="material-icons-outlined" style="font-size: 18px; width: 18px; height: 18px;" aria-hidden="true">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle -->
      <button
        type="button"
        class="m-2 flex items-center justify-center gap-2 px-2 py-2 text-xs font-medium transition-colors"
        style="border-radius: var(--r-sm); border: 1px solid rgba(212,200,179,0.18); color: var(--sand-400); background: transparent;"
        (click)="toggleCollapse.emit()"
        [attr.aria-expanded]="!collapsed()"
        [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        (mouseenter)="onCollapseHover($event, true)"
        (mouseleave)="onCollapseHover($event, false)"
      >
        <span class="material-icons-outlined" style="font-size: 18px;" aria-hidden="true">
          {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
        </span>
        @if (!collapsed()) {
          <span>Collapse</span>
        }
      </button>
    </aside>

    <style>
      .sidebar-link-active {
        background: rgba(250,247,242,0.08) !important;
        color: var(--sand-50) !important;
      }
    </style>
  `,
})
export class AppSidebarComponent {
  items = input<SidebarNavItem[]>([]);
  collapsed = input(false);
  toggleCollapse = output<void>();

  onLinkHover(event: MouseEvent, entering: boolean): void {
    const el = event.currentTarget as HTMLElement;
    if (el.classList.contains('sidebar-link-active')) return;
    el.style.background = entering ? 'rgba(250,247,242,0.06)' : '';
    el.style.color = entering ? 'var(--sand-100)' : 'var(--sand-300)';
  }

  onCollapseHover(event: MouseEvent, entering: boolean): void {
    const el = event.currentTarget as HTMLElement;
    el.style.background = entering ? 'rgba(250,247,242,0.06)' : 'transparent';
  }
}
