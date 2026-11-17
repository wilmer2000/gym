import { inject } from '@angular/core';
import { SqlService } from './services/sql.service';

export async function intiDatabase() {
  const sqlService = inject(SqlService);
  await sqlService.initDatabase();
}
