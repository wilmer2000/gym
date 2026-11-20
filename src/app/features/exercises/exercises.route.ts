import { Routes } from '@angular/router';

export const exercisesRoutes: Routes = [
  {
    path: 'exercises',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/exercise-list/exercise-list.component').then(
            (m) => m.ExerciseListPage,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/exercise-detail/exercise-detail.component').then(
            (m) => m.ExerciseDetailPage,
          ),
      },
    ],
  },
];
