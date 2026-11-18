import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { Selector } from '../../../../core/modules/form/components/selector/selector.component';
import { Option } from '../../../../core/modules/form/interfaces/option';
import { dateInput, startOfDay } from '../../../../core/utils/date.util';
import { ScheduleMode, WEEKDAYS } from '../../interfaces/plan';

@Component({
  selector: 'app-plan-schedule-form',
  imports: [Input, Selector, FormsModule],
  templateUrl: './plan-schedule.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanScheduleForm {
  readonly mode = input.required<ScheduleMode>();
  readonly startDate = input.required<string>();
  readonly endDate = input.required<string>();
  readonly selectedDays = input.required<number[]>();
  readonly dates = input.required<number[]>();

  readonly modeChange = output<ScheduleMode>();
  readonly startDateChange = output<string>();
  readonly endDateChange = output<string>();
  readonly selectedDaysChange = output<number[]>();
  readonly datesChange = output<number[]>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly modeOptions: Option[] = [
    { id: 'weekly', label: 'Días de la semana' },
    { id: 'dates', label: 'Fechas específicas' },
  ];
  protected readonly newDate = signal('');

  setMode(value: string): void {
    this.modeChange.emit(value as ScheduleMode);
  }

  toggleDay(value: number): void {
    const days = this.selectedDays();

    this.selectedDaysChange.emit(
      days.includes(value) ? days.filter((day) => day !== value) : [...days, value],
    );
  }

  addDate(): void {
    const date = startOfDay(this.newDate());

    if (date === null) {
      return;
    }

    const dates = this.dates();

    this.datesChange.emit(dates.includes(date) ? dates : [...dates, date].sort((a, b) => a - b));
    this.newDate.set('');
  }

  removeDate(date: number): void {
    this.datesChange.emit(this.dates().filter((value) => value !== date));
  }

  dateLabel(date: number): string {
    return dateInput(date);
  }
}
