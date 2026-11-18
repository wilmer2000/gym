import { inject } from '@angular/core';
import { ExerciseSqlService } from './services/exercise-sql.service';
import { MainSqlService } from './services/main-sql.service';

export async function intiDatabase() {
  const main = inject(MainSqlService);
  const exercises = inject(ExerciseSqlService);

  // The wasm module is a shared singleton, so both connections load in parallel.
  await Promise.all([main.init(), exercises.init()]);
}
