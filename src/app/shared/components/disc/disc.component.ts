import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// Conic disc that shows a 0-100 percentage.
@Component({
  selector: 'app-disc',
  template: `
    <div
      role="progressbar"
      [attr.aria-label]="label()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="percent()"
      [style.background]="background()"
    >
      <span>{{ percent() }}%</span>
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    div {
      display: grid;
      place-items: center;
      width: 6rem;
      height: 6rem;
      border-radius: 50%;
    }

    span {
      display: grid;
      place-items: center;
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 50%;
      background: var(--color-app);
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Disc {
  percent = input.required<number>();
  label = input('Uso');

  protected readonly background = computed(
    () => `conic-gradient(var(--color-primary) ${this.percent()}%, var(--color-gray-600) 0)`,
  );
}
