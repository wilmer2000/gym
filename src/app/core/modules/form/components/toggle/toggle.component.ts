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

    label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    input {
      appearance: none;
      flex-shrink: 0;
      width: 2.75rem;
      height: 1.5rem;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 9999px;
      background: var(--color-gray-600);
      cursor: pointer;
      transition: background-color 150ms;
    }

    input::after {
      content: '';
      display: block;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0.125rem;
      border-radius: 9999px;
      background: var(--color-gray-200);
      transition: transform 150ms;
    }

    input:checked {
      background: var(--color-primary);
    }

    input:checked::after {
      transform: translateX(1.25rem);
    }

    input:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
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
