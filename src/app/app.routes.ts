import { Routes } from '@angular/router';
import { canAccess } from './core/modules/login/guards/can-access.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./core/modules/login/components/login/login.component').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [canAccess],
    loadComponent: () => import('./core/components/layout/base/base.component').then((m) => m.Base),
    children: [
      {
        path: 'config',
        loadComponent: () =>
          import('./core/modules/config/components/config/config.component').then((m) => m.Config),
      },
      {
        path: 'exercises',
        loadChildren: () =>
          import('./features/exercises/exercises.routes').then((m) => m.EXERCISES_ROUTES),
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
