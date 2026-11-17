// Accepts the date representations found in the app: Date instances, epoch
// milliseconds (number or numeric text), ISO strings and dd/MM/yyyy text.
// SQLite TEXT columns return epoch integers as "1736089200000.0".
import { DateRange } from '../modules/form/components/range-date/range-date.component';

const EPOCH = /^-?\d+(?:\.0+)?$/;
const DAY_MONTH_YEAR = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Date(value) : null;
  }

  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (text === '') {
    return null;
  }

  if (EPOCH.test(text)) {
    return new Date(Number(text));
  }

  const parts = DAY_MONTH_YEAR.exec(text);

  if (parts) {
    return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateTime(value: unknown): number {
  return parseDate(value)?.getTime() ?? 0;
}

// Local calendar day as yyyy-mm-dd, comparable with native date inputs.
export function dateOnly(value: unknown): string {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

// Local calendar day as dd/MM/yyyy, the text the transaction form expects.
export function dateInput(value: unknown): string {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

// Local clock time as dd/MM/yyyy hh:mm, following the app's date convention.
export function formatUpdate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

export function inRange(date: Date, range: DateRange | null): boolean {
  if (!range) {
    return true;
  }

  const value = dateTime(date);

  return (
    (range.from ? value >= dateTime(range.from) : true) &&
    (range.to ? value < dateTime(range.to) + ONE_DAY : true)
  );
}
