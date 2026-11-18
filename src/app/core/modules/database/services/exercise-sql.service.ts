import { Injectable } from '@angular/core';
import { EXERCISES_SCHEMA, exercisesSeed } from '../../../../features/exercises/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class ExerciseSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_exercises';
  protected override readonly schema = EXERCISES_SCHEMA;
  protected override readonly seed = exercisesSeed();
}
