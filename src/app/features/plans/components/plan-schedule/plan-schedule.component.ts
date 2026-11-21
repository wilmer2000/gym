import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WEEKDAYS } from '../../interfaces/plan';
import { Section } from '../../../../shared/components/section/section.component';

@Component({
  selector: 'app-plan-schedule-form',
  templateUrl: './plan-schedule.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Section],
})
export class PlanScheduleForm {
  selectedDays = input.required<number[]>();
  selectedDaysChange = output<number[]>();
  protected readonly weekdays = WEEKDAYS;

  toggleDay(value: number): void {
    const days = this.selectedDays();

    this.selectedDaysChange.emit(
      days.includes(value) ? days.filter((day) => day !== value) : [...days, value],
    );
  }
}
