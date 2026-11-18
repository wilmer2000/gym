import { inject } from '@angular/core';
import { CatalogSqlService } from './services/catalog-sql.service';
import { MainSqlService } from './services/main-sql.service';

export async function intiDatabase() {
  const main = inject(MainSqlService);
  const catalog = inject(CatalogSqlService);

  // The wasm module is a shared singleton, so both connections load in parallel.
  await Promise.all([main.init(), catalog.init()]);
}
