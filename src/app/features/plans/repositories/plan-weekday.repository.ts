import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import { PlanWeekday } from '../interfaces/plan';

@Injectable({ providedIn: 'root' })
export class PlanWeekdayRepository extends RepositoryBase<PlanWeekday> {
  protected override readonly sqlite = inject(MainSqlService);

  protected override table = 'plan_weekdays';
  protected override idColumn = 'id';
  protected override defaultOrder = 'day_of_week ASC';

  protected override toRow(entity: PlanWeekday): Record<string, unknown> {
    return {
      id: entity.id,
      plan_id: entity.planId,
      day_of_week: entity.dayOfWeek,
    };
  }

  protected override fromRow(row: Record<string, any>): PlanWeekday {
    return {
      id: Number(row['id']),
      planId: Number(row['plan_id']),
      dayOfWeek: Number(row['day_of_week']),
    };
  }

  listByPlan(planId: number): PlanWeekday[] {
    return this.queryRaw(
      'SELECT * FROM plan_weekdays WHERE plan_id = ? ORDER BY day_of_week ASC;',
      [planId],
    );
  }

  replaceAll(planId: number, days: number[]): void {
    this.sqlite.transaction(() => {
      this.sqlite.run('DELETE FROM plan_weekdays WHERE plan_id = ?;', [planId]);

      for (const day of days) {
        this.sqlite.run('INSERT INTO plan_weekdays (plan_id, day_of_week) VALUES (?, ?);', [
          planId,
          day,
        ]);
      }
    });
  }
}
