import { Injectable } from '@angular/core';
import { Database } from 'sql.js';
import { MAIN_SCHEMA, PLAN_EXERCISES_SETS_MIGRATION } from '../../../../features/plans/schema';
import { EXERCISE_ID_RENAMES } from '../../../../features/exercises/schema';
import { PROFILE_SCHEMA, PROFILE_SEED } from '../../../../features/profile/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class MainSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_main';
  protected override readonly schema = `${MAIN_SCHEMA}\n${PROFILE_SCHEMA}`;
  protected override readonly seed = PROFILE_SEED;

  protected override migrate(db: Database): void {
    const columns = db.exec('PRAGMA table_info(plan_exercises)')[0]?.values ?? [];

    if (!columns.some((column) => column[1] === 'sets')) {
      db.run(PLAN_EXERCISES_SETS_MIGRATION);
    }

    // Keeps existing plans pointing at the renamed catalog exercises.
    for (const [oldId, newId] of Object.entries(EXERCISE_ID_RENAMES)) {
      db.run('UPDATE plan_exercises SET exercise_id = ? WHERE exercise_id = ?;', [newId, oldId]);
    }
  }
}
