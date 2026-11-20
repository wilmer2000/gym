import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Avatar } from '../../avatar/avatar.component';

@Component({
  selector: 'app-header',
  imports: [Avatar],
  template: ` <div class="flex w-full"><app-avatar /></div> `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
