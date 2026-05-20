// Author: S2401265 Ahmed Aslan Ibrahim
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-shell-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="border-t border-[var(--border)] bg-white/80 px-4 py-3 text-center text-xs text-[var(--fg-3)]"
    >
      © {{ year }} Grand Plaza Hotel Management System
    </footer>
  `,
})
export class ShellFooterComponent {
  readonly year = new Date().getFullYear();
}
