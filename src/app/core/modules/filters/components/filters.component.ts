import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Option } from '../../form/interfaces/option';
import { DateRange, RangeDate } from '../../form/components/range-date/range-date.component';

import { Selector } from '../../form/components/selector/selector.component';
import {
  SearchSelect,
  SearchValue,
} from '../../form/components/search-select/search-select.component';
import { Toggle } from '../../form/components/toggle/toggle.component';
import { Input } from '../../form/components/input/input.component';

export interface Filter {
  id: string;
  title?: string;
  options: Option[];
  type:
    | 'multi'
    | 'single'
    | 'date'
    | 'date-range'
    | 'text'
    | 'number'
    | 'password'
    | 'email'
    | 'url'
    | 'tel'
    | 'time'
    | 'search'
    | 'search-selection'
    | 'toggle';
}

export type Selections = Record<string, string[]>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-filters',
  imports: [FormsModule, RangeDate, Input, Selector, SearchSelect, Toggle],
  templateUrl: './filters.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Filters {
  filters = input<Filter[]>([]);
  selections = signal<Selections>({});
  defaults = computed(() =>
    this.filters().reduce((acc, filter) => {
      acc[filter.id] = this.normalize(filter);
      return acc;
    }, {} as Selections),
  );
  dirty = computed(() =>
    this.filters().some(
      (filter) =>
        this.key(this.currentSelection(filter.id)) !== this.key(this.defaults()[filter.id]),
    ),
  );

  readonly selectionChange = output<Selections>();

  searchText = computed(() => {
    const search = this.filters().find((filter) => filter.type === 'search');

    return search ? this.inputValue(search.id) : '';
  });

  optionValue(filterId: string): string {
    return this.currentSelection(filterId)[0] ?? '';
  }

  inputValue(filterId: string): string {
    return this.currentSelection(filterId)[0] ?? '';
  }

  rangeValue(filterId: string): DateRange {
    const [from = '', to = ''] = this.currentSelection(filterId);

    return { from, to };
  }

  toggleValue(filterId: string): boolean {
    return this.currentSelection(filterId)[0] === 'true';
  }

  label(filter: Filter): string {
    if (filter.type === 'search') return 'Buscar';
    if (filter.type === 'search-selection') return 'Buscar en';
    return filter.title ?? '';
  }

  private key(values: string[]): string {
    return [...values].sort().join('\u0000');
  }

  selectOption(filterId: string, value: string): void {
    const filter = this.filters().find((candidate) => candidate.id === filterId);
    if (!filter) return;

    const current = this.currentSelection(filterId);
    const updated = value === '' ? [] : [value];

    if (this.key(updated) === this.key(current)) return;

    this.selections.update((previous) => ({ ...previous, [filterId]: updated }));

    this.emit();
  }

  setInput(filterId: string, value: string): void {
    const current = this.currentSelection(filterId);
    const updated = value === '' ? [] : [value];

    if (this.key(updated) === this.key(current)) return;

    this.selections.update((previous) => ({ ...previous, [filterId]: updated }));

    this.emit();
  }

  setSearch(filterId: string, value: SearchValue): void {
    const search = this.filters().find((filter) => filter.type === 'search');

    this.selections.update((previous) => ({
      ...previous,
      [filterId]: [value.id],
      ...(search ? { [search.id]: value.text === '' ? [] : [value.text] } : {}),
    }));

    this.emit();
  }

  setRange(filterId: string, range: DateRange): void {
    const current = this.currentSelection(filterId);
    const updated = range.from === '' && range.to === '' ? [] : [range.from, range.to];

    if (this.key(updated) === this.key(current)) return;

    this.selections.update((previous) => ({ ...previous, [filterId]: updated }));

    this.emit();
  }

  setToggle(filterId: string, value: boolean): void {
    const current = this.currentSelection(filterId);
    const updated = value ? ['true'] : [];

    if (this.key(updated) === this.key(current)) return;

    this.selections.update((previous) => ({ ...previous, [filterId]: updated }));

    this.emit();
  }

  clear(): void {
    this.selections.set(this.defaults());
    this.emit();
  }

  private emit(): void {
    this.selectionChange.emit(
      this.filters().reduce((acc, filter) => {
        acc[filter.id] = this.currentSelection(filter.id);
        return acc;
      }, {} as Selections),
    );
  }

  private normalize(filter: Filter): string[] {
    if (filter.type === 'multi' || filter.type === 'single' || filter.type === 'search-selection') {
      return filter.options.length ? [filter.options[0].id] : [];
    }
    if (filter.type === 'date-range') {
      const year = new Date().getFullYear();
      return [`${year}-01-01`, `${year}-12-31`];
    }
    return [];
  }

  private currentSelection(filterId: string): string[] {
    return this.selections()[filterId] ?? this.defaults()[filterId];
  }
}
