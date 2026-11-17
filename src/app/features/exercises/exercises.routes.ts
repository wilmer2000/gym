import { Routes } from '@angular/router';

export const EXERCISES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/exercise-list.page').then((m) => m.ExerciseListPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/exercise-detail.page').then((m) => m.ExerciseDetailPage),
  },
];
