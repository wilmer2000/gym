import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { ExerciseSqlService } from '../../../core/modules/database/services/exercise-sql.service';
import { Exercise, Equipment, ExerciseType, Muscle } from '../interfaces/exercise';

@Injectable({ providedIn: 'root' })
export class ExerciseRepository extends RepositoryBase<Exercise> {
  protected override readonly sqlite = inject(ExerciseSqlService);

  protected override table = 'exercises';
  protected override idColumn = 'id';
  protected override defaultOrder = 'name COLLATE NOCASE ASC';

  protected override toRow(entity: Exercise): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      exercise_type: entity.exerciseType,
      equipment: entity.equipment,
      primary_muscle: entity.primaryMuscle,
      secondary_muscles: JSON.stringify(entity.secondaryMuscles ?? []),
      description: entity.description,
      created_at: entity.createdAt,
    };
  }

  protected override fromRow(row: Record<string, any>): Exercise {
    return {
      id: String(row['id']),
      name: String(row['name']),
      exerciseType: row['exercise_type'] as ExerciseType,
      equipment: row['equipment'] as Equipment,
      primaryMuscle: row['primary_muscle'] as Muscle,
      secondaryMuscles: this.secondaryMuscles(row['secondary_muscles']),
      description: row['description'] ?? null,
      createdAt: Number(row['created_at']),
    };
  }

  listAll(): Exercise[] {
    return this.findAll();
  }

  search({ name, primaryMuscle }: { name?: string; primaryMuscle?: string } = {}): Exercise[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (name?.trim()) {
      conditions.push('name LIKE ?');
      params.push(`%${name.trim()}%`);
    }

    if (primaryMuscle) {
      conditions.push('primary_muscle = ?');
      params.push(primaryMuscle);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    return this.queryRaw(
      `SELECT * FROM ${this.table}${where} ORDER BY ${this.defaultOrder}`,
      params,
    );
  }

  private secondaryMuscles(value: unknown): Muscle[] {
    try {
      const parsed = JSON.parse(String(value ?? '[]'));

      return Array.isArray(parsed) ? (parsed as Muscle[]) : [];
    } catch {
      return [];
    }
  }
}
