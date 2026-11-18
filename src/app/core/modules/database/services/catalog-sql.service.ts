import { Injectable } from '@angular/core';
import { CATALOG_SCHEMA, catalogSeed } from '../../../../features/catalog/schema';
import { SqlDatabase } from './sql-database';

@Injectable({ providedIn: 'root' })
export class CatalogSqlService extends SqlDatabase {
  protected override readonly dbKey = 'gym_catalog';
  protected override readonly schema = CATALOG_SCHEMA;
  protected override readonly seed = catalogSeed();
}
