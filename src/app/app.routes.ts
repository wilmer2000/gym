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
        path: '',
        pathMatch: 'full',
        redirectTo: 'plans',
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./features/plans/components/plan-list/plan-list.component').then((m) => m.PlanListPage),
      },
      {
        path: 'plans/new',
        loadComponent: () =>
          import('./features/plans/components/plan-form/plan-form.component').then((m) => m.PlanFormPage),
      },
      {
        path: 'plans/:id/edit',
        loadComponent: () =>
          import('./features/plans/components/plan-form/plan-form.component').then((m) => m.PlanFormPage),
      },
      {
        path: 'plans/:id',
        loadComponent: () =>
          import('./features/plans/components/plan-detail/plan-detail.component').then((m) => m.PlanDetailPage),
      },
      {
        path: 'exercises',
        loadComponent: () =>
          import('./features/exercises/components/exercise-list/exercise-list.component').then((m) => m.ExerciseListPage),
      },
      {
        path: 'exercises/:id',
        loadComponent: () =>
          import('./features/exercises/components/exercise-detail/exercise-detail.component').then((m) => m.ExerciseDetailPage),
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./core/modules/config/components/config/config.component').then((m) => m.Config),
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
