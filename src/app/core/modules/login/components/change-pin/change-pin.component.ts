import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';

import { LoginForm } from '../login-form/login-form.component';
import { AuthService } from '../../../../services/auth.service';
import { ModalService } from '../../../modal/services/modal.service';

@Component({
  selector: 'app-change-pin',
  imports: [LoginForm],
  template: `
    <div (keydown.enter)="modal.trigger('ok')">
      @if (step() === 'current') {
        <app-login-form label="PIN actual" [error]="error()" (valueChange)="pin.set($event)" />
      } @else {
        <app-login-form
          label="Nuevo PIN"
          description="Ingresá el PIN nuevo de 6 dígitos."
          [error]="error()"
          (valueChange)="pin.set($event)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePin {
  private readonly auth = inject(AuthService);
  readonly modal = inject(ModalService);
  private readonly form = viewChild.required(LoginForm);

  readonly step = signal<'current' | 'new'>('current');
  readonly pin = signal('');
  readonly error = signal('');

  constructor() {
    const id = this.modal.modal()?.id;

    if (id !== undefined) {
      this.modal.guard(id, () => this.confirm());
    }
  }

  // Runs on the modal's ok button (and Enter): step 1 validates and stays open, step 2 saves.
  private confirm(): boolean {
    if (this.pin().length !== 6) {
      this.error.set('Ingresá los 6 dígitos.');
      return false;
    }

    if (this.step() === 'current') {
      if (!this.auth.validate(this.pin())) {
        this.error.set('PIN incorrecto.');
        this.form().reset();
        return false;
      }

      this.pin.set('');
      this.error.set('');
      this.step.set('new');

      return false;
    }

    return this.auth.changePin(this.pin());
  }
}
