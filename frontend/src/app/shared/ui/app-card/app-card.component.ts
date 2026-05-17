import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="card-surface"
      style="padding: 20px;"
      [class]="paddingClass()"
    >
      @if (title()) {
        <header style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <h2 style="font-family: var(--font-display); font-size: 18px; font-weight: 400; letter-spacing: -0.01em; margin: 0; color: var(--fg);">
              {{ title() }}
            </h2>
            <ng-content select="[cardActions]" />
          </div>
        </header>
      }
      <ng-content />
    </section>
  `,
})
export class AppCardComponent {
  title = input<string>('');
  paddingClass = input<string>('');
}
