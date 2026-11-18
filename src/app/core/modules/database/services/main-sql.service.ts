import { Injectable } from '@angular/core';
import { Database } from 'sql.js';
import { MAIN_SCHEMA, PLAN_EXERCISES_SETS_MIGRATION } from '../../../../features/plans/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class MainSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_main';
  protected override readonly schema = MAIN_SCHEMA;
  protected override readonly seed = null;

  protected override migrate(db: Database): void {
    const columns = db.exec('PRAGMA table_info(plan_exercises)')[0]?.values ?? [];

    if (!columns.some((column) => column[1] === 'sets')) {
      db.run(PLAN_EXERCISES_SETS_MIGRATION);
    }
  }
}
