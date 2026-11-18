import { Plan, PlanDate, PlanWeekday, WEEKDAYS } from '../interfaces/plan';

function shortDate(epoch: number): string {
  const date = new Date(epoch);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}`;
}

// Text the list and the detail show: "Lun/Mié/Vie · 12/05–30/06" or "3 fechas".
export function scheduleSummary(plan: Plan, weekdays: PlanWeekday[], dates: PlanDate[]): string {
  if (plan.scheduleMode === 'dates') {
    return `${dates.length} ${dates.length === 1 ? 'fecha' : 'fechas'}`;
  }

  const order = WEEKDAYS.map((day) => day.value);
  const days = [...weekdays]
    .sort((a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek))
    .map((weekday) => WEEKDAYS.find((day) => day.value === weekday.dayOfWeek)?.label ?? '')
    .join('/');

  const range = plan.startDate
    ? `${shortDate(plan.startDate)}${plan.endDate ? `–${shortDate(plan.endDate)}` : ''}`
    : '';

  return [days, range].filter(Boolean).join(' · ');
}
