import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Toggle),
      multi: true,
    },
  ],
  templateUrl: './toggle.component.html',
  styles: `
    :host {
      display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toggle implements ControlValueAccessor {
  id = input.required<string>();
  label = input('');

  value = signal(false);
  protected readonly disabled = signal(false);
  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  writeValue(value: boolean | null): void {
    this.value.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  setValue(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;

    this.value.set(value);
    this.onChange(value);
  }
}
