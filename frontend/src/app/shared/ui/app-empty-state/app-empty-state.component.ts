// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MSG } from '../../../core/i18n/ui-messages';
import { AppButtonComponent } from '../app-button/app-button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)]/50 px-6 py-14 text-center"
      role="status"
    >
      <span class="material-icons-outlined text-4xl text-[var(--fg-3)]" aria-hidden="true">{{
        icon()
      }}</span>
      <h3 class="text-base font-semibold text-[var(--fg)]">
        {{ title() }}
      </h3>
      <p class="max-w-sm text-sm text-[var(--fg-2)]">
        {{ hint() }}
      </p>
      @if (actionLabel()) {
        <app-button variant="primary" (clicked)="action.emit()">{{ actionLabel() }}</app-button>
      }
    </div>
  `,
})
export class AppEmptyStateComponent {
  icon = input<string>('inbox');
  title = input<string>(MSG.empty.defaultTitle);
  hint = input<string>(MSG.empty.defaultHint);
  actionLabel = input<string>('');
  action = output<void>();
}
