import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Page shell: title header plus the projected page content.
@Component({
  selector: 'app-container',
  template: `
    <section class="flex flex-col gap-8 w-full">
      <div class="flex gap-2 justify-between items-center min-h-10">
        <div class="flex flex-col">
          @if (title() || subtitle()) {
            <h1 class="font-medium text-3xl truncate">{{ title() }}</h1>
            @if (subtitle()) {
              <p class="text-sm leading">{{ subtitle() }}</p>
            }
          }
        </div>
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
