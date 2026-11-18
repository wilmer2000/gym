import { Injectable } from '@angular/core';
import { Database } from 'sql.js';
import {
  EXERCISE_ID_RENAMES,
  EXERCISES_SCHEMA,
  exercisesSeed,
} from '../../../../features/exercises/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class ExerciseSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_exercises';
  protected override readonly schema = EXERCISES_SCHEMA;
  protected override readonly seed = exercisesSeed();

  protected override migrate(db: Database): void {
    const columns = db.exec('PRAGMA table_info(exercises)')[0]?.values ?? [];

    // The catalog is fixed and its ids changed, so an old muscle_group table is rebuilt.
    if (columns.some((column) => column[1] === 'muscle_group')) {
      db.run('DROP TABLE exercises;');
      db.run(EXERCISES_SCHEMA);
    }

    // Old ids stay behind because the seed only inserts; the plans are remapped in the main DB.
    for (const oldId of Object.keys(EXERCISE_ID_RENAMES)) {
      db.run('DELETE FROM exercises WHERE id = ?;', [oldId]);
    }
  }
}
