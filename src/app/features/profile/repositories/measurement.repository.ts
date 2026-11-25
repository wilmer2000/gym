import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import { DateRange } from '../../../core/modules/form/components/range-date/range-date.component';
import { Measurement, MeasurementInput } from '../interfaces/profile';

@Injectable({ providedIn: 'root' })
export class MeasurementRepository extends RepositoryBase<Measurement> {
  protected override readonly sqlite = inject(MainSqlService);

  protected override table = 'measurements';
  protected override idColumn = 'id';
  protected override defaultOrder = 'date DESC, id DESC';

  protected override toRow(entity: Measurement): Record<string, unknown> {
    return {
      id: entity.id,
      profile_id: entity.profileId,
      date: entity.date,
      weight: entity.weight,
      body_fat: entity.bodyFat,
      notes: entity.notes,
    };
  }

  protected override fromRow(row: Record<string, any>): Measurement {
    return {
      id: Number(row['id']),
      profileId: Number(row['profile_id']),
      date: String(row['date']),
      weight: Number(row['weight']),
      bodyFat: row['body_fat'] == null ? null : Number(row['body_fat']),
      notes: row['notes'] ?? null,
    };
  }

  listByProfile(profileId: number, range?: DateRange): Measurement[] {
    const conditions = ['profile_id = ?'];
    const params: unknown[] = [profileId];

    if (range?.from) {
      conditions.push('date >= ?');
      params.push(range.from);
    }

    if (range?.to) {
      conditions.push('date <= ?');
      params.push(range.to);
    }

    return this.queryRaw(
      `SELECT * FROM measurements WHERE ${conditions.join(' AND ')} ORDER BY ${this.defaultOrder};`,
      params,
    );
  }

  upsert(input: MeasurementInput): void {
    const values = [input.profileId, input.date, input.weight, input.bodyFat, input.notes];

    if (input.id) {
      this.sqlite.run(
        'UPDATE measurements SET profile_id = ?, date = ?, weight = ?, body_fat = ?, notes = ? WHERE id = ?;',
        [...values, input.id],
      );

      return;
    }

    this.sqlite.run(
      'INSERT INTO measurements (profile_id, date, weight, body_fat, notes) VALUES (?, ?, ?, ?, ?);',
      values,
    );
  }
}
