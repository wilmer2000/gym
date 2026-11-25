import { Routes } from '@angular/router';
import { configRoutes } from './core/modules/config/config.route';
import { dashboardRoutes } from './features/dashboard/dashboard.route';
import { exercisesRoutes } from './features/exercises/exercises.route';
import { plansRoutes } from './features/plans/plans.route';
import { profileRoutes } from './features/profile/profile.route';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/components/layout/base/base.component').then((m) => m.Base),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      ...dashboardRoutes,
      ...plansRoutes,
      ...exercisesRoutes,
      ...profileRoutes,
      ...configRoutes,
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
