import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Page shell: title header plus the projected page content.
@Component({
  selector: 'app-container',
  template: `
    <section class="flex flex-col gap-8 w-full">
      <div class="flex gap-2">
        @if (title() || subtitle()) {
          <div class="flex flex-col">
            <h1 class="font-medium text-3xl">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="text-lg">{{ subtitle() }}</p>
            }
          </div>
        }
        <ng-content select="[header]" />
      </div>
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
  title = input<string>();
  subtitle = input<string>();
}
