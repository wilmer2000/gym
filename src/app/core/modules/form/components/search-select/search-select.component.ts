import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { Option } from '../../interfaces/option.interface';

export interface SearchValue {
  id: string;
  text: string;
}

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchSelect {
  id = input.required<string>();
  label = input('');
  placeholder = input('');
  text = input('');
  options = input<Option[]>([]);

  selected = linkedSignal(() => this.options()[0]?.id ?? '');
  query = linkedSignal(() => this.text());
  readonly searchChange = output<SearchValue>();

  setOption(event: Event): void {
    this.selected.set((event.target as HTMLSelectElement).value);
  }

  search(event: Event): void {
    const text = (event.target as HTMLInputElement).value;

    this.query.set(text);
    this.searchChange.emit({ id: this.selected(), text });
  }
}
