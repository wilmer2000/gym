import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly auth = inject(AuthService);

  login(digits: readonly string[]): boolean {
    return this.auth.login(digits.join(''));
  }
}
