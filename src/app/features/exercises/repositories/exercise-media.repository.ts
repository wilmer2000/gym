import { Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { ExerciseMedia, MediaType } from '../interfaces/exercise-media';

@Injectable({ providedIn: 'root' })
export class ExerciseMediaRepository extends RepositoryBase<ExerciseMedia> {
  protected override table = 'exercise_media';
  protected override idColumn = 'id';
  protected override defaultOrder = 'sort_order ASC, id ASC';

  protected override toRow(entity: ExerciseMedia): Record<string, unknown> {
    return {
      id: entity.id,
      exercise_id: entity.exerciseId,
      type: entity.type,
      url: entity.url,
      sort_order: entity.sortOrder,
      created_at: entity.createdAt,
    };
  }

  protected override fromRow(row: Record<string, any>): ExerciseMedia {
    return {
      id: Number(row['id']),
      exerciseId: Number(row['exercise_id']),
      type: row['type'] as MediaType,
      url: String(row['url']),
      sortOrder: Number(row['sort_order']),
      createdAt: Number(row['created_at']),
    };
  }

  listByExercise(exerciseId: number): ExerciseMedia[] {
    return this.queryRaw(
      `SELECT * FROM ${this.table} WHERE exercise_id = ? ORDER BY ${this.defaultOrder}`,
      [exerciseId],
    );
  }
}
