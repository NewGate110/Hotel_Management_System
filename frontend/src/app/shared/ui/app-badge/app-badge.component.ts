// Author: S2401265 Ahmed Aslan Ibrahim
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [ngClass]="toneClass()">
      @if (dot()) {
        <span class="badge-dot" [style.background]="dotColor()"></span>
      }
      <ng-content />
    </span>
  `,
})
export class AppBadgeComponent {
  tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'ink'>('neutral');
  dot = input(false);

  readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'danger':  return 'badge-danger';
      case 'info':    return 'badge-info';
      case 'ink':     return 'badge-ink';
      default:        return 'badge-neutral';
    }
  });

  readonly dotColor = computed(() => {
    switch (this.tone()) {
      case 'success': return 'var(--glass-500)';
      case 'warning': return 'var(--clay-500)';
      case 'danger':  return '#A8412E';
      case 'info':    return 'var(--azure-500)';
      case 'ink':     return 'var(--clay-200)';
      default:        return 'var(--sand-400)';
    }
  });
}
