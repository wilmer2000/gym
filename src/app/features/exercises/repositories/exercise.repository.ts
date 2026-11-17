import { Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { Equipment, Exercise } from '../interfaces/exercise';
import { ExerciseMedia } from '../interfaces/exercise-media';

@Injectable({ providedIn: 'root' })
export class ExerciseRepository extends RepositoryBase<Exercise> {
  protected override table = 'exercises';
  protected override idColumn = 'id';
  protected override defaultOrder = 'name COLLATE NOCASE ASC';

  protected override toRow(entity: Exercise): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      primary_muscle: entity.primaryMuscle,
      secondary_muscles: JSON.stringify(entity.secondaryMuscles),
      equipment: entity.equipment,
      record_type: entity.recordType,
      instructions: entity.instructions,
      notes: entity.notes,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  protected override fromRow(row: Record<string, any>): Exercise {
    return {
      id: Number(row['id']),
      name: String(row['name']),
      description: row['description'] ?? null,
      primaryMuscle: String(row['primary_muscle']),
      secondaryMuscles: this.parseMuscles(row['secondary_muscles']),
      equipment: row['equipment'] as Equipment,
      recordType: row['record_type'],
      instructions: row['instructions'] ?? null,
      notes: row['notes'] ?? null,
      createdAt: Number(row['created_at']),
      updatedAt: Number(row['updated_at']),
    };
  }

  search(
    term: string,
    filters: { primaryMuscle?: string; equipment?: Equipment } = {},
  ): Exercise[] {
    const conditions: string[] = [];
    const params: unknown[] = [];
    const text = term.trim();

    if (text) {
      conditions.push('name LIKE ?');
      params.push(`%${text}%`);
    }

    if (filters.primaryMuscle) {
      conditions.push('primary_muscle = ?');
      params.push(filters.primaryMuscle);
    }

    if (filters.equipment) {
      conditions.push('equipment = ?');
      params.push(filters.equipment);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    return this.queryRaw(
      `SELECT * FROM ${this.table}${where} ORDER BY ${this.defaultOrder}`,
      params,
    );
  }

  // One transaction for the exercise and its media: two save() calls would
  // leave the exercise stored without media if the second one failed.
  saveWithMedia(entity: Exercise, media: ExerciseMedia[]): number {
    const db = this.sqlite.database;

    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    const row = this.toRow(entity);
    // A new exercise has no id yet: leave the column out so SQLite assigns one.
    const keys = Object.keys(row).filter((key) => key !== this.idColumn || entity.id > 0);

    db.run('BEGIN TRANSACTION;');

    try {
      db.run(
        `INSERT OR REPLACE INTO ${this.table} (${keys.map((key) => `\`${key}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')});`,
        keys.map((key) => this.param(row[key])),
      );

      const id = Number(
        this.sqlite.select<Record<string, number>>('SELECT last_insert_rowid() AS id')[0]?.['id'] ??
          entity.id,
      );

      db.run('DELETE FROM exercise_media WHERE exercise_id = ?;', [id]);

      for (const item of media) {
        db.run(
          'INSERT INTO exercise_media (exercise_id, type, url, sort_order, created_at) VALUES (?, ?, ?, ?, ?);',
          [id, item.type, item.url.trim(), item.sortOrder, item.createdAt],
        );
      }

      db.run('COMMIT;');
      void this.sqlite.persist();

      return id;
    } catch (error) {
      db.run('ROLLBACK;');

      throw error;
    }
  }

  private parseMuscles(value: unknown): string[] {
    try {
      const parsed = JSON.parse(String(value ?? '[]'));

      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
}
