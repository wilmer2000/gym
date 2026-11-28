import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-badge',
  imports: [NgIcon],
  template: `
    <p
      class="flex items-center gap-2 leading-0 px-2 py-1 rounded-full w-auto"
      [class]="!clean() ? color() : ''"
    >
      @if (icon(); as icon) {
        <span><ng-icon [name]="icon" /></span>
      }
      @if (label(); as label) {
        <span class="text-sm">{{ label }}</span>
      }
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  icon = input<string>();
  label = input<string>();
  color = input('bg-gray-600/30');
  clean = input(false);
}
