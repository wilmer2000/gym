import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  template: ` <div class="flex w-full h-12">
    {{ title() }}
  </div> `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  title = signal<string>('app-header');
}
