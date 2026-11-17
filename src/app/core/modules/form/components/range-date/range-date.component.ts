import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../input/input.component';

export interface DateRange {
  from: string;
  to: string;
}

@Component({
  selector: 'app-range-date',
  imports: [FormsModule, Input],
  templateUrl: './range-date.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeDate implements OnInit {
  from = signal('');
  to = signal('');
  initial = input<DateRange>({ from: '', to: '' });
  showClean = input(true);
  readonly rangeChange = output<DateRange>();

  invalid = computed(() => this.from() !== '' && this.to() !== '' && this.from() > this.to());
  hasRange = computed(() => this.from() !== '' || this.to() !== '');

  ngOnInit(): void {
    this.from.set(this.initial().from);
    this.to.set(this.initial().to);
  }

  setValue(key: keyof DateRange, value: string): void {
    this[key].set(value);

    if (!this.invalid()) {
      this.emit();
    }
  }

  clear(): void {
    this.from.set('');
    this.to.set('');
    this.emit();
  }

  private emit(): void {
    this.rangeChange.emit({ from: this.from(), to: this.to() });
  }
}
