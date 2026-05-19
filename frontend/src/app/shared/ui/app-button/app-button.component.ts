// Author: S2401265 Ahmed Aslan Ibrahim
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled()"
      (click)="clicked.emit($event)"
      class="inline-flex w-full items-center justify-center gap-2 transition-all disabled:pointer-events-none disabled:opacity-40"
      style="font-family: var(--font-sans); font-size: 14px; font-weight: 500; padding: 12px 22px; border-radius: var(--r-md); border: 1px solid transparent; cursor: pointer; letter-spacing: 0.01em; white-space: nowrap;"
      [ngClass]="classes()"
    >
      @if (loading()) {
        <span
          class="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class AppButtonComponent {
  type = input<'button' | 'submit'>('button');
  variant = input<'primary' | 'secondary' | 'ghost' | 'accent'>('primary');
  disabled = input(false);
  loading = input(false);
  clicked = output<MouseEvent>();

  readonly classes = computed(() => {
    switch (this.variant()) {
      case 'secondary':
        return 'bg-[var(--surface)] text-[var(--fg)] border-[var(--border-strong)] hover:border-[var(--sand-900)] active:scale-[0.98]';
      case 'ghost':
        return 'bg-transparent text-[var(--fg)] hover:bg-[var(--sand-100)] active:scale-[0.98]';
      case 'accent':
        return 'bg-[var(--accent)] text-[var(--sand-50)] hover:bg-[var(--accent-hover)] active:scale-[0.98]';
      default:
        return 'bg-[var(--brand)] text-[var(--sand-50)] hover:bg-[var(--brand-hover)] active:scale-[0.98]';
    }
  });
}
