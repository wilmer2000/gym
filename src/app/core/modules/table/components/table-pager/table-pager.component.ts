import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { RowContext, Table, TableColumn } from '../table/table.component';
import { Pager } from '../pager/pager.component';

@Component({
  selector: 'app-table-pager',
  imports: [Table, Pager],
  templateUrl: './table-pager.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePager {
  columns = input.required<TableColumn[]>();
  rows = input<readonly unknown[]>([]);
  size = input(10);
  selectable = input(false);
  editable = input(false);
  scrollable = input(false);
  removable = input(false);
  rowKey = input('');
  highlightRows = input<ReadonlySet<unknown> | null>(null);
  sortKey = input('');
  sortDirection = input<'asc' | 'desc'>('asc');
  actionsTemplate = input<TemplateRef<RowContext>>();
  cellTemplates = input<Record<string, TemplateRef<RowContext>>>({});

  selectionChange = output<unknown[]>();
  sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();
  editFields = output<{ ids: string[] }>();
  remove = output<{ ids: string[] }>();

  selectedKeys = signal<string[]>([]);
  canEdit = computed(() => this.selectedKeys().length > 0);

  private readonly table = viewChild(Table);

  page = signal(0);
  pageSize = linkedSignal(() => this.size());
  pages = computed(() => Math.max(1, Math.ceil(this.rows().length / Math.max(1, this.pageSize()))));
  current = computed(() => Math.min(this.page(), this.pages() - 1));
  pagedRows = computed(() => {
    const start = this.current() * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  clearSelection(): void {
    this.selectedKeys.set([]);
    this.table()?.clearSelection();
  }

  onSelectionChange(keys: unknown[]): void {
    this.selectedKeys.set(keys.map((key) => String(key)));
    this.selectionChange.emit(keys);
  }

  openEdit(): void {
    if (this.canEdit()) {
      this.editFields.emit({ ids: this.selectedKeys() });
    }
  }

  openRemove(): void {
    if (this.canEdit()) {
      this.remove.emit({ ids: this.selectedKeys() });
    }
  }

  changeSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(0);
  }
}
