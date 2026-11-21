import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { LoginForm } from '../login-form/login-form.component';

@Component({
  selector: 'app-login',
  imports: [LoginForm],
  templateUrl: './login.component.html',
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
