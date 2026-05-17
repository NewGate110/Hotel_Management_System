import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold uppercase"
      [style]="styleStr()"
      [attr.aria-label]="'Avatar for ' + name()"
    >
      {{ initials() }}
    </span>
  `,
})
export class AppAvatarComponent {
  name = input.required<string>();
  toneClass = input('');

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '?';
    const b = parts.length > 1 ? parts[parts.length - 1]![0] : parts[0]?.[1];
    return (a + (b ?? '')).toUpperCase();
  });

  readonly styleStr = computed(() => {
    const tc = this.toneClass();
    if (tc) return '';
    return 'background: var(--glass-500); color: var(--sand-50);';
  });
}
