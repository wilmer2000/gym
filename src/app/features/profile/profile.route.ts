import { Routes } from '@angular/router';
import { canAccess } from '../../core/modules/login/guards/can-access.guard';

export const profileRoutes: Routes = [
  {
    path: 'profile',
    canActivate: [canAccess],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/profile-view/profile-view.component').then(
            (m) => m.ProfileViewPage,
          ),
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('./components/profile-form/profile-form.component').then(
            (m) => m.ProfileFormPage,
          ),
      },
      {
        path: 'measurements',
        loadComponent: () =>
          import('./components/measurements-list/measurements-list.component').then(
            (m) => m.MeasurementsListPage,
          ),
      },
    ],
  },
];
