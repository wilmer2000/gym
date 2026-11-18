import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import { PlanDate } from '../interfaces/plan';

@Injectable({ providedIn: 'root' })
export class PlanDateRepository extends RepositoryBase<PlanDate> {
  protected override readonly sqlite = inject(MainSqlService);

  protected override table = 'plan_dates';
  protected override idColumn = 'id';
  protected override defaultOrder = 'specific_date ASC';

  protected override toRow(entity: PlanDate): Record<string, unknown> {
    return {
      id: entity.id,
      plan_id: entity.planId,
      specific_date: entity.specificDate,
    };
  }

  protected override fromRow(row: Record<string, any>): PlanDate {
    return {
      id: Number(row['id']),
      planId: Number(row['plan_id']),
      specificDate: Number(row['specific_date']),
    };
  }

  listByPlan(planId: number): PlanDate[] {
    return this.queryRaw('SELECT * FROM plan_dates WHERE plan_id = ? ORDER BY specific_date ASC;', [
      planId,
    ]);
  }

  replaceAll(planId: number, dates: number[]): void {
    this.sqlite.transaction(() => {
      this.sqlite.run('DELETE FROM plan_dates WHERE plan_id = ?;', [planId]);

      for (const date of dates) {
        this.sqlite.run('INSERT INTO plan_dates (plan_id, specific_date) VALUES (?, ?);', [
          planId,
          date,
        ]);
      }
    });
  }
}
