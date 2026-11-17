import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Page shell: title header plus the projected page content.
@Component({
  selector: 'app-container',
  template: `
    <section class="flex flex-col h-full gap-4 w-full">
      <header class="flex flex-col justify-between gap-3 lg:flex-row">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold text-primary">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="text-sm text-text-muted">{{ subtitle() }}</p>
          }
        </div>
        <ng-content select="[header]" />
      </header>

      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Container {
  title = input.required<string>();
  subtitle = input<string>();
}
