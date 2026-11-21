import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import { Plan, PlanInput } from '../interfaces/plan';
import { PlanExerciseRepository } from './plan-exercise.repository';
import { PlanWeekdayRepository } from './plan-weekday.repository';

@Injectable({ providedIn: 'root' })
export class PlanRepository extends RepositoryBase<Plan> {
  protected override readonly sqlite = inject(MainSqlService);

  private readonly planExercises = inject(PlanExerciseRepository);
  private readonly planWeekdays = inject(PlanWeekdayRepository);

  protected override table = 'plans';
  protected override idColumn = 'id';
  protected override defaultOrder = 'name COLLATE NOCASE ASC';

  protected override toRow(entity: Plan): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      active: entity.active ? 1 : 0,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  protected override fromRow(row: Record<string, any>): Plan {
    return {
      id: Number(row['id']),
      name: String(row['name']),
      description: row['description'] ?? null,
      active: Number(row['active']) === 1,
      createdAt: Number(row['created_at']),
      updatedAt: Number(row['updated_at']),
    };
  }

  listActive(): Plan[] {
    return this.queryRaw(`SELECT * FROM plans WHERE active = 1 ORDER BY ${this.defaultOrder}`);
  }

  search({ name, active }: { name?: string; active?: boolean } = {}): Plan[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (name?.trim()) {
      conditions.push('name LIKE ?');
      params.push(`%${name.trim()}%`);
    }

    if (active !== undefined) {
      conditions.push('active = ?');
      params.push(active ? 1 : 0);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    return this.queryRaw(`SELECT * FROM plans${where} ORDER BY ${this.defaultOrder}`, params);
  }

  setActive(id: number, active: boolean): void {
    this.sqlite.run('UPDATE plans SET active = ?, updated_at = ? WHERE id = ?;', [
      active ? 1 : 0,
      Date.now(),
      id,
    ]);
  }

  // Saves the plan, its weekdays and exercises in one transaction. A new plan
  // has no id yet, so the id comes from last_insert_rowid().
  savePlan(input: PlanInput): number {
    return this.sqlite.transaction(() => {
      const now = Date.now();
      let id = input.id ?? 0;

      if (id > 0) {
        this.sqlite.run(
          `UPDATE plans SET name = ?, description = ?, active = ?, updated_at = ? WHERE id = ?;`,
          [input.name, input.description, input.active ? 1 : 0, now, id],
        );
      } else {
        this.sqlite.run(
          `INSERT INTO plans (name, description, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?);`,
          [input.name, input.description, input.active ? 1 : 0, now, now],
        );
        id = Number(
          this.sqlite.query<{ id: number }>('SELECT last_insert_rowid() AS id')[0]?.id ?? 0,
        );
      }

      this.planExercises.replaceAll(id, input.exercises);
      this.planWeekdays.replaceAll(id, input.weekdays);

      return id;
    });
  }
}
