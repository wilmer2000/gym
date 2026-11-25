import { dateOnly } from '../../../core/utils/date.util';

// ISO yyyy-mm-dd as dd/mm/yyyy without passing through Date (avoids timezone shifts).
export function displayDay(value: string | null): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function today(): string {
  return dateOnly(new Date());
}
