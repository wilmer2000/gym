import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { CatalogSqlService } from '../../../core/modules/database/services/catalog-sql.service';
import { CatalogExercise, Equipment } from '../interfaces/exercise';

@Injectable({ providedIn: 'root' })
export class CatalogExerciseRepository extends RepositoryBase<CatalogExercise> {
  protected override readonly sqlite = inject(CatalogSqlService);

  protected override table = 'exercises';
  protected override idColumn = 'id';
  protected override defaultOrder = 'name COLLATE NOCASE ASC';

  protected override toRow(entity: CatalogExercise): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      muscle_group: entity.muscleGroup,
      equipment: entity.equipment,
      description: entity.description,
      created_at: entity.createdAt,
    };
  }

  protected override fromRow(row: Record<string, any>): CatalogExercise {
    return {
      id: String(row['id']),
      name: String(row['name']),
      muscleGroup: String(row['muscle_group']),
      equipment: row['equipment'] as Equipment,
      description: row['description'] ?? null,
      createdAt: Number(row['created_at']),
    };
  }

  listAll(): CatalogExercise[] {
    return this.findAll();
  }

  search({ name, muscleGroup }: { name?: string; muscleGroup?: string } = {}): CatalogExercise[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (name?.trim()) {
      conditions.push('name LIKE ?');
      params.push(`%${name.trim()}%`);
    }

    if (muscleGroup) {
      conditions.push('muscle_group = ?');
      params.push(muscleGroup);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    return this.queryRaw(
      `SELECT * FROM ${this.table}${where} ORDER BY ${this.defaultOrder}`,
      params,
    );
  }
}
