import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { inject, isDevMode } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

export const canAccess: CanActivateFn = () =>
  isDevMode() ||
  inject(AuthService).logged() ||
  new RedirectCommand(inject(Router).parseUrl('login'), { replaceUrl: true });
