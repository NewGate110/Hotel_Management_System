// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string | readonly unknown[];
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Breadcrumb" style="font-size: var(--fs-sm); color: var(--fg-3);">
      <ol class="flex flex-wrap items-center gap-2" style="list-style: none; margin: 0; padding: 0;">
        @for (item of items(); track $index; let last = $last) {
          <li class="flex items-center gap-2">
            @if (!last && item.link) {
              <a
                style="font-weight: 500; color: var(--fg-2); text-decoration: none; transition: color var(--dur-fast) var(--ease-out);"
                [routerLink]="item.link"
                onmouseenter="this.style.color='var(--fg)'"
                onmouseleave="this.style.color='var(--fg-2)'"
              >{{ item.label }}</a>
            } @else {
              <span [style.fontWeight]="last ? '600' : '400'" [style.color]="last ? 'var(--fg)' : 'var(--fg-3)'">
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <span aria-hidden="true" style="color: var(--sand-300);">/</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class AppBreadcrumbComponent {
  items = input<BreadcrumbItem[]>([]);
}
