import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Exercise, ExerciseGroup } from '../../interfaces/exercise';
import { RouterLink } from '@angular/router';
import {
  EquipmentIcons,
  EquipmentTranslations,
  exerciseImage,
  ExerciseTypeIcons,
  ExerciseTypeTranslations,
} from '../../constants/exercises.constant';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-exercises-group',
  imports: [RouterLink, NgIcon],
  templateUrl: './exercises-group.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesGroup {
  groups = input<ExerciseGroup[]>([]);

  equipment(exercise: Exercise): string {
    return EquipmentTranslations[exercise.equipment];
  }

  image(exercise: Exercise): string {
    return exerciseImage(exercise.id);
  }

  type(exercise: Exercise): string {
    return ExerciseTypeTranslations[exercise.exerciseType];
  }

  typeIcon(exercise: Exercise): string {
    return ExerciseTypeIcons[exercise.exerciseType];
  }

  equipmentIcon(exercise: Exercise): string {
    return EquipmentIcons[exercise.equipment];
  }
}
