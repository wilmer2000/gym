import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WEEKDAYS } from '../../../features/plans/interfaces/plan';

const WEEKDAY_INITIAL = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

@Component({
  selector: 'app-week',
  template: `
    <div role="img" title="Days of the week" class="flex gap-1">
      @for (mark of marks(); track mark.value) {
        <div
          class="grid self-center rounded-full items-center justify-center bg-gray-600 text-xs text-gray-300 text-center leading-none"
          [class]="small() ? 'w-5 aspect-square' : 'px-2 py-1'"
          [class.bg-primary!]="mark.active"
          [class.text-gray-950!]="mark.active"
        >
          @if (small()) {
            <small>{{ mark.initial }}</small>
          } @else {
            <small>{{ mark.label }}</small>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Week {
  days = input.required<number[]>();
  small = input(true);

  readonly marks = computed(
    () =>
      WEEKDAYS.map((weekday) => ({
        value: weekday.value,
        initial: WEEKDAY_INITIAL[weekday.value],
        label: weekday.label,
        active: this.days().includes(weekday.value),
      })).sort((a, b) => a.value - b.value), // Sunday-first: D L M M J V S
  );
}
