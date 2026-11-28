import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Exercise, ExerciseGroup } from '../../interfaces/exercise';
import { RouterLink } from '@angular/router';
import { exerciseImage } from '../../constants/exercises.constant';
import { Badge } from '../../../../shared/components/badge/badge.component';
import {
  ExerciseEquipmentIconPipe,
  ExerciseEquipmentPipe,
  ExerciseTypeIconPipe,
  ExerciseTypePipe,
} from '../../pipes/exercise.pipe';

@Component({
  selector: 'app-exercises-group',
  imports: [
    RouterLink,
    Badge,
    ExerciseTypeIconPipe,
    ExerciseTypePipe,
    ExerciseEquipmentIconPipe,
    ExerciseEquipmentPipe,
  ],
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

  image(exercise: Exercise): string {
    return exerciseImage(exercise.id);
  }
}
