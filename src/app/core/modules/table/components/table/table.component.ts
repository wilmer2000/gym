import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  PipeTransform,
  signal,
  TemplateRef,
} from '@angular/core';
import { parseDate } from '../../../../utils/date.util';
import { DynamicPipe } from '../../pipes/dynamic.pipe';

export type CellFormat = 'text' | 'date' | 'currency';

const ROW_DEFAULT = 'hover:bg-surface-muted transition';
const ROW_SELECTED = 'bg-accent-100 text-primary transition';
const ROW_HIGHLIGHT = 'bg-red-100 transition';

export interface TableColumn {
  key: string;
  label: string;
  format?: CellFormat;
  pipe?: PipeTransform | PipeTransform[];
  headClass?: string;
  class?: string;
}

// Passed to cell/actions templates: the row itself plus its rowKey value.
export interface RowContext {
  $implicit: unknown;
  id: string;
}

interface CellView {
  column: TableColumn;
  class: string;
  value: unknown;
  text: string;
  amount: number | null;
  date: Date | null;
}

interface HeaderView {
  column: TableColumn;
  class: string;
}

interface RowView {
  key: unknown;
  id: string;
  entity: unknown;
  selected: boolean;
  class: string;
  cells: CellView[];
}

@Component({
  selector: 'app-table',
  imports: [CurrencyPipe, DatePipe, DynamicPipe, NgTemplateOutlet],
  templateUrl: './table.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {
  columns = input.required<TableColumn[]>();
  rows = input<readonly unknown[]>([]);
  selectable = input(false);
  scrollable = input(false);
  rowKey = input('');
  highlightRows = input<ReadonlySet<unknown> | null>(null);
  sortKey = input('');
  sortDirection = input<'asc' | 'desc'>('asc');
  total = input<number>(0);
  actionsTemplate = input<TemplateRef<RowContext>>();
  cellTemplates = input<Record<string, TemplateRef<RowContext>>>({});

  selectionChange = output<unknown[]>();
  sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();

  selected = signal<ReadonlySet<unknown>>(new Set());
  headers = computed<HeaderView[]>(() =>
    this.columns().map((column) => ({ column, class: this.headClass(column) })),
  );
  view = computed<RowView[]>(() => {
    const columns = this.columns();
    const selected = this.selected();
    const highlighted = this.highlightRows();

    return this.rows().map((row) => {
      const key = this.keyOf(row);
      const isSelected = selected.has(key);
      const isHighlighted = highlighted?.has(key) ?? false;

      return {
        key,
        id: String(key),
        entity: row,
        selected: isSelected,
        class: isHighlighted ? ROW_HIGHLIGHT : isSelected ? ROW_SELECTED : ROW_DEFAULT,
        cells: columns.map((column) => this.cell(row, column)),
      };
    });
  });
  selectedCount = computed(() => this.selected().size);
  allPageSelected = computed(
    () => this.view().length > 0 && this.view().every((row) => this.selected().has(row.key)),
  );
  somePageSelected = computed(
    () => !this.allPageSelected() && this.view().some((row) => this.selected().has(row.key)),
  );

  clearSelection(): void {
    this.selected.set(new Set());
  }

  toggle(key: unknown): void {
    this.selected.update((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
    this.emitSelection();
  }

  toggleSort(column: TableColumn): void {
    const direction: 'asc' | 'desc' =
      this.sortKey() === column.key && this.sortDirection() === 'asc' ? 'desc' : 'asc';

    this.sortChange.emit({ key: column.key, direction });
  }

  ariaSort(column: TableColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== column.key) {
      return 'none';
    }

    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  togglePage(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.selected.update((current) => {
      const next = new Set(current);

      for (const row of this.view()) {
        if (checked) {
          next.add(row.key);
        } else {
          next.delete(row.key);
        }
      }

      return next;
    });
    this.emitSelection();
  }

  private emitSelection(): void {
    this.selectionChange.emit([...this.selected()]);
  }

  private keyOf(row: unknown): unknown {
    const key = this.rowKey();

    return key ? (row as Record<string, unknown>)[key] : row;
  }

  private headClass(column: TableColumn): string {
    return `sticky top-0 z-10 border-b border-border bg-surface-muted px-2 py-3 md:px-6 font-medium ${column.headClass ?? ''}`;
  }

  private cell(row: unknown, column: TableColumn): CellView {
    const value = (row as Record<string, unknown>)[column.key];
    const empty = value === null || value === undefined || value === '';
    const numeric = Number(value);
    const amount =
      column.format === 'currency' && !empty && Number.isFinite(numeric) ? numeric : null;
    const date = column.format === 'date' && !empty ? parseDate(value) : null;

    return {
      column,
      class: `px-2 py-2 md:px-6 md:py-4 ${column.class ?? ''}`,
      value: empty ? '' : value,
      text: empty ? '' : String(value),
      amount,
      date,
    };
  }
}
