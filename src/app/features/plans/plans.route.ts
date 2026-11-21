import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: 'plans',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/plan-list/plan-list.component').then((m) => m.PlanListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/plan-form/plan-form.component').then((m) => m.PlanFormPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/plan-form/plan-form.component').then((m) => m.PlanFormPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/plan-detail/plan-detail.component').then((m) => m.PlanDetailPage),
      },
    ],
  },
];
