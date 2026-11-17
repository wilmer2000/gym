import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

const FIELDS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as const;

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="text-lg font-semibold text-text-primary">{{ label() }}</h1>

    @if (description()) {
      <p class="label-helper">{{ description() }}</p>
    }

    <form [formGroup]="form">
      <div class="my-6 flex justify-between gap-2">
        @for (field of fields; track field; let i = $index) {
          <input
            #pinInput
            [formControlName]="field"
            type="password"
            inputmode="numeric"
            maxlength="1"
            autocomplete="off"
            class="input w-11 text-center text-lg"
            [attr.aria-label]="'Dígito ' + (i + 1)"
            (input)="onInput(i, $event)"
            (keydown.backspace)="onBackspace(i, $event)"
          />
        }
      </div>
    </form>

    @if (error()) {
      <p class="mb-3 text-sm text-danger" role="alert">{{ error() }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('pinInput');

  readonly label = input('Ingresá tu PIN');
  readonly description = input('');
  readonly error = input('');
  readonly valueChange = output<string>();

  readonly fields = FIELDS;
  readonly form = this.formBuilder.nonNullable.group({
    d1: ['', Validators.pattern(/^\d$/)],
    d2: ['', Validators.pattern(/^\d$/)],
    d3: ['', Validators.pattern(/^\d$/)],
    d4: ['', Validators.pattern(/^\d$/)],
    d5: ['', Validators.pattern(/^\d$/)],
    d6: ['', Validators.pattern(/^\d$/)],
  });

  constructor() {
    afterNextRender(() => this.inputs()[0]?.nativeElement.focus());
  }

  reset(): void {
    this.form.reset();
    this.emit();
    this.inputs()[0]?.nativeElement.focus();
  }

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    input.value = digit;
    this.form.controls[FIELDS[index]].setValue(digit);
    this.emit();

    if (digit) {
      this.inputs()[index + 1]?.nativeElement.focus();
    }
  }

  onBackspace(index: number, event: Event): void {
    if (index > 0 && !this.form.controls[FIELDS[index]].value) {
      event.preventDefault();
      this.inputs()[index - 1]?.nativeElement.focus();
    }
  }

  private emit(): void {
    this.valueChange.emit(FIELDS.map((field) => this.form.controls[field].value).join(''));
  }
}
