import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { LoginForm } from '../login-form/login-form.component';

@Component({
  selector: 'app-login',
  imports: [LoginForm],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted p-4">
      <div class="card w-full max-w-sm p-6" (keydown.enter)="submit()">
        <app-login-form
          description="La primera vez que lo ingreses quedará guardado en este dispositivo."
          [error]="error()"
          (valueChange)="pin.set($event)"
        />

        <button
          type="button"
          class="btn-primary mt-3 w-full"
          [disabled]="pin().length !== 6"
          (click)="submit()"
        >
          Ingresar
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly form = viewChild.required(LoginForm);

  readonly pin = signal('');
  readonly error = signal('');

  submit(): void {
    if (this.pin().length !== 6) {
      return;
    }

    if (this.loginService.login(this.pin().split(''))) {
      void this.router.navigate(['/']);
      return;
    }

    // Wrong PIN: keep the lock and try again.
    this.error.set('PIN incorrecto.');
    this.form().reset();
  }
}
