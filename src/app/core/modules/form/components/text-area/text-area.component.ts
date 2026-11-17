import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextArea),
      multi: true,
    },
  ],
  templateUrl: './text-area.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextArea implements ControlValueAccessor {
  id = input.required<string>();
  label = input('');
  placeholder = input('');
  rows = input(3);

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
    const value = (event.target as HTMLTextAreaElement).value;

    this.value.set(value);
    this.onChange(value);
  }
}
