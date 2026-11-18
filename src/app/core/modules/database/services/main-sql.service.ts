import { Injectable } from '@angular/core';
import { MAIN_SCHEMA } from '../../../../features/plans/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class MainSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_main';
  protected override readonly schema = MAIN_SCHEMA;
  protected override readonly seed = null;
}
