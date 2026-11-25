import { inject, Injectable } from '@angular/core';
import { RepositoryBase } from '../../../core/modules/database/repository/repository.base';
import { MainSqlService } from '../../../core/modules/database/services/main-sql.service';
import {
  Profile,
  ProfileExperienceLevel,
  ProfileGoal,
  ProfileSex,
} from '../interfaces/profile';

@Injectable({ providedIn: 'root' })
export class ProfileRepository extends RepositoryBase<Profile> {
  protected override readonly sqlite = inject(MainSqlService);

  protected override table = 'profile';
  protected override idColumn = 'id';
  protected override defaultOrder = 'name COLLATE NOCASE ASC';

  protected override toRow(entity: Profile): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      surname: entity.surname,
      birth_date: entity.birthDate,
      sex: entity.sex,
      height: entity.height,
      goal: entity.goal,
      experience_level: entity.experienceLevel,
      training_days_per_week: entity.trainingDaysPerWeek,
      target_weight: entity.targetWeight,
      target_calories: entity.targetCalories,
      target_protein: entity.targetProtein,
    };
  }

  protected override fromRow(row: Record<string, any>): Profile {
    return {
      id: Number(row['id']),
      name: String(row['name']),
      surname: String(row['surname']),
      birthDate: row['birth_date'] ?? null,
      sex: row['sex'] as ProfileSex,
      height: row['height'] == null ? null : Number(row['height']),
      goal: row['goal'] as ProfileGoal,
      experienceLevel: row['experience_level'] as ProfileExperienceLevel,
      trainingDaysPerWeek: Number(row['training_days_per_week']),
      targetWeight: row['target_weight'] == null ? null : Number(row['target_weight']),
      targetCalories: row['target_calories'] == null ? null : Number(row['target_calories']),
      targetProtein: row['target_protein'] == null ? null : Number(row['target_protein']),
    };
  }
}
