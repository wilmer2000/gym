import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input implements ControlValueAccessor {
  id = input.required<string>();
  label = input('');
  placeholder = input('');
  type = input('text');
  inputmode = input('');
  min = input('');
  max = input('');
  invalid = input(false);

  value = signal('');
  protected readonly disabled = signal(false);
  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  setValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.value.set(value);
    this.onChange(value);
  }
}
