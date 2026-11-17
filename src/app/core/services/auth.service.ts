import { computed, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

interface AuthState {
  pin: string;
}

const AUTH_KEY = 'app-auth';
const PIN_PATTERN = /^\d{6}$/;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storage = inject(StorageService);
  // The stored PIN is the lock; `logged` is session-only, so opening the app always asks for it.
  private readonly lock = signal<AuthState | null>(this.storage.getItem<AuthState>(AUTH_KEY));
  private readonly state = signal(false);

  readonly logged = computed(() => this.state());

  // First visit: the PIN typed becomes the lock PIN. Later visits: it must match.
  login(pin: string): boolean {
    if (!PIN_PATTERN.test(pin)) {
      return false;
    }

    const lock = this.lock();

    if (!lock) {
      this.store(pin);
    } else if (lock.pin !== pin) {
      return false;
    }

    this.state.set(true);

    return true;
  }

  validate(pin: string): boolean {
    return this.lock()?.pin === pin;
  }

  changePin(pin: string): boolean {
    if (!PIN_PATTERN.test(pin)) {
      return false;
    }

    this.store(pin);

    return true;
  }

  logout(): void {
    this.state.set(false);
  }

  private store(pin: string): void {
    const next = { pin };

    this.storage.setItem(AUTH_KEY, next);
    this.lock.set(next);
  }
}
