import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TableColumn } from '../table/table.component';
import { TablePager } from '../table-pager/table-pager.component';
import { Filter, Filters } from '../../../filters/components/filters.component';
import { dateOnly, dateTime } from '../../../../utils/date.util';
import { Container } from '../../../../components/container/container.component';

type Row = Record<string, any>;

@Component({
  selector: 'app-records-table',
  imports: [TablePager, Container, Filters],
  templateUrl: './records-table.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsTable {
  title = input.required<string>();
  columns = input.required<TableColumn[]>();
  rows = input<readonly Row[]>([]);
  filters = input<Filter[]>([]);
  editable = input(false);
  removable = input(false);
  searchValue = input<(row: Row, column: string) => string>();
  sortValue = input<(row: Row, key: string) => string | number>();

  edit = output<{ ids: string[] }>();
  remove = output<{ ids: string[] }>();

  private readonly tablePager = viewChild(TablePager);
  private readonly selections = signal<Record<string, string[]>>({});
  sortKey = signal('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  filtered = computed(() => {
    const filters = this.filters();
    const searchFilter = filters.find((filter) => filter.type === 'search');
    const columnFilter = filters.find((filter) => filter.type === 'search-selection');
    const rangeFilter = filters.find((filter) => filter.type === 'date-range');
    const term = (searchFilter ? (this.values(searchFilter)[0] ?? '') : '').trim().toLowerCase();
    const column = (columnFilter ? this.values(columnFilter)[0] : '') || '';
    const [from = '', to = ''] = rangeFilter ? this.values(rangeFilter) : [];
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    const key = this.sortKey();

    const active = filters
      .filter((filter) => filter.type === 'multi' || filter.type === 'single')
      .map((filter) => ({
        id: filter.id,
        values: this.values(filter)
          .filter((value) => value !== 'all')
          .map((value) => (value === 'none' ? '' : value)),
      }))
      .filter((filter) => filter.values.length > 0);

    const rows = this.rows().filter(
      (row) =>
        active.every((filter) => filter.values.includes(String(row[filter.id] ?? ''))) &&
        (!rangeFilter ||
          ((from === '' || dateOnly(row['date']) >= from) &&
            (to === '' || dateOnly(row['date']) <= to))),
    );
    const sorted = [...rows].sort((a, b) => direction * this.compare(a, b, key));

    if (term === '') {
      return sorted;
    }

    const search = this.searchValue();

    return sorted.filter((row) =>
      (search ? search(row, column) : String(row[column] ?? '')).toLowerCase().includes(term),
    );
  });

  setSort(event: { key: string; direction: 'asc' | 'desc' }): void {
    this.sortKey.set(event.key);
    this.sortDirection.set(event.direction);
  }

  setSelection(selections: Record<string, string[]>): void {
    this.selections.set(selections);

    const search = this.filters().find((filter) => filter.type === 'search');

    if (search && (this.values(search)[0] ?? '') === '') {
      this.clearSelection();
    }
  }

  clearSelection(): void {
    this.tablePager()?.clearSelection();
  }

  private values(filter: Filter): string[] {
    const selection = this.selections()[filter.id];

    if (selection) {
      return selection;
    }

    if (filter.type === 'multi' || filter.type === 'single' || filter.type === 'search-selection') {
      return filter.options.length ? [filter.options[0].id] : [];
    }

    if (filter.type === 'date-range') {
      const year = new Date().getFullYear();
      return [`${year}-01-01`, `${year}-12-31`];
    }

    return [];
  }

  private compare(a: Row, b: Row, key: string): number {
    const accessor = this.sortValue();
    const left = accessor ? accessor(a, key) : this.defaultSortValue(a, key);
    const right = accessor ? accessor(b, key) : this.defaultSortValue(b, key);

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(left).localeCompare(String(right), 'es', { numeric: true });
  }

  private defaultSortValue(row: Row, key: string): string | number {
    const value = row[key];

    if (key === 'date') {
      return dateTime(value);
    }

    return typeof value === 'number' ? value : String(value ?? '');
  }
}
