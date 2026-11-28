import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  imports: [NgIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Button),
      multi: true,
    },
  ],
  styles: `
    :host {
      display: inline-block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button implements ControlValueAccessor {
  protected readonly disabled = signal(false);
  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  label = input('');
  iconButton = input(false);
  icon = input('');
  value = signal(false);

  readonly removed = output<boolean>();

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

  remove(): void {
    this.value.set(true);
    this.onChange(true);
    this.removed.emit(true);
  }
}
