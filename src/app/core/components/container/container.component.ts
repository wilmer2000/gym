import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Page shell: title header plus the projected page content.
@Component({
  selector: 'app-container',
  template: `
    <section>
      <header>
        <div>
          <h1>{{ title() }}</h1>
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
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
