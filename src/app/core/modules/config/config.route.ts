import { Routes } from '@angular/router';

export const configRoutes: Routes = [
  {
    path: 'config',
    loadComponent: () => import('./components/config/config.component').then((m) => m.Config),
  },
];
