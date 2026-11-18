import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import { PlanExercise } from '../interfaces/plan';

@Injectable({ providedIn: 'root' })
export class PlanExerciseRepository extends RepositoryBase<PlanExercise> {
  protected override readonly sqlite = inject(MainSqlService);

  protected override table = 'plan_exercises';
  protected override idColumn = 'id';
  protected override defaultOrder = 'sort_order ASC';

  protected override toRow(entity: PlanExercise): Record<string, unknown> {
    return {
      id: entity.id,
      plan_id: entity.planId,
      exercise_id: entity.exerciseId,
      reps: entity.reps,
      sort_order: entity.sortOrder,
    };
  }

  protected override fromRow(row: Record<string, any>): PlanExercise {
    return {
      id: Number(row['id']),
      planId: Number(row['plan_id']),
      exerciseId: String(row['exercise_id']),
      reps: Number(row['reps']),
      sortOrder: Number(row['sort_order']),
    };
  }

  listByPlan(planId: number): PlanExercise[] {
    return this.queryRaw(
      'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY sort_order ASC;',
      [planId],
    );
  }

  // Replaces the whole ordered list; the array index is the new sort_order.
  replaceAll(planId: number, items: { exerciseId: string; reps: number }[]): void {
    this.sqlite.transaction(() => {
      this.sqlite.run('DELETE FROM plan_exercises WHERE plan_id = ?;', [planId]);

      items.forEach((item, index) => {
        this.sqlite.run(
          'INSERT INTO plan_exercises (plan_id, exercise_id, reps, sort_order) VALUES (?, ?, ?, ?);',
          [planId, item.exerciseId, item.reps, index],
        );
      });
    });
  }
}
