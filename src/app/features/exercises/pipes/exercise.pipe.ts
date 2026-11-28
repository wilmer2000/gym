import { Pipe, PipeTransform } from '@angular/core';
import { Equipment, ExerciseType } from '../interfaces/exercise';
import {
  EquipmentIcons,
  EquipmentTranslations,
  ExerciseTypeIcons,
  ExerciseTypeTranslations,
} from '../constants/exercises.constant';

@Pipe({ name: 'exerciseTypeIcon' })
export class ExerciseTypeIconPipe implements PipeTransform {
  transform(exerciseType: ExerciseType): string {
    return ExerciseTypeIcons[exerciseType];
  }
}

@Pipe({ name: 'exerciseType' })
export class ExerciseTypePipe implements PipeTransform {
  transform(exerciseType: ExerciseType): string {
    return ExerciseTypeTranslations[exerciseType];
  }
}

@Pipe({ name: 'exerciseEquipmentIcon' })
export class ExerciseEquipmentIconPipe implements PipeTransform {
  transform(equipment: Equipment): string {
    return EquipmentIcons[equipment];
  }
}

@Pipe({ name: 'exerciseEquipment' })
export class ExerciseEquipmentPipe implements PipeTransform {
  transform(equipment: Equipment): string {
    return EquipmentTranslations[equipment];
  }
}
