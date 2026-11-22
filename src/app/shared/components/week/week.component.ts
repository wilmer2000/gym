import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WEEKDAYS } from '../../../features/plans/interfaces/plan';

// Small dot per weekday, Sunday-first, with the initial of its name.
const WEEKDAY_INITIAL = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

@Component({
  selector: 'app-week',
  template: `
    <div role="img" title="Days of the week" class="flex gap-1">
      @for (mark of marks(); track mark.value) {
        <div
          class="grid self-center rounded-full aspect-square items-center bg-gray-600 text-gray-300 w-4 text-xs text-center leading-none"
          [class.bg-primary!]="mark.active"
          [class.text-gray-950!]="mark.active"
        >
          <small>{{ mark.initial }}</small>
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

  protected readonly marks = computed(
    () =>
      WEEKDAYS.map((weekday) => ({
        value: weekday.value,
        initial: WEEKDAY_INITIAL[weekday.value],
        active: this.days().includes(weekday.value),
      })).sort((a, b) => a.value - b.value), // Sunday-first: D L M M J V S
  );
}
