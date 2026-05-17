import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="card-surface"
      style="padding: 20px 22px;"
    >
      <p style="font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-3); margin: 0 0 14px;">
        {{ label() }}
      </p>
      <p class="price" style="font-size: 40px; line-height: 1; margin: 0;">
        {{ value() }}
      </p>
      @if (delta()) {
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 10px;">
          @if (deltaUp() === true) {
            <span class="material-icons-outlined" style="font-size: 13px; color: var(--glass-700);">trending_up</span>
            <span style="font-size: 12px; color: var(--glass-700);">{{ delta() }}</span>
          } @else if (deltaUp() === false) {
            <span class="material-icons-outlined" style="font-size: 13px; color: #A8412E;">trending_down</span>
            <span style="font-size: 12px; color: #A8412E;">{{ delta() }}</span>
          } @else {
            <span style="font-size: 12px; color: var(--fg-3);">{{ delta() }}</span>
          }
        </div>
      }
      @if (hint()) {
        <p style="font-size: 11px; color: var(--fg-3); margin: 4px 0 0;">{{ hint() }}</p>
      }
    </article>
  `,
})
export class AppStatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  hint = input<string>('');
  delta = input<string>('');
  deltaUp = input<boolean | null>(null);
}
