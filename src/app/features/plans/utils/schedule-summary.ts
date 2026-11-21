import { Plan, PlanWeekday, WEEKDAYS } from '../interfaces/plan';

// Text the list and the detail show: "Lun/Mié/Vie".
export function scheduleSummary(weekdays: PlanWeekday[]): string {
  const order = WEEKDAYS.map((day) => day.value);

  return [...weekdays]
    .sort((a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek))
    .map((weekday) => WEEKDAYS.find((day) => day.value === weekday.dayOfWeek)?.label ?? '')
    .join('/');
}
