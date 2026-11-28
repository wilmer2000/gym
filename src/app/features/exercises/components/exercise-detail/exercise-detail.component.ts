import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import {
  EquipmentTranslations,
  ExerciseTypeTranslations,
  MuscleTranslations,
  exerciseImage,
} from '../../constants/exercises.constant';
import { Exercise } from '../../interfaces/exercise';
import { ExerciseRepository } from '../../repositories/exercise.repository';
import { Button } from '../../../../core/modules/form/components/button/button.component';

@Component({
  selector: 'app-exercise-detail',
  imports: [Container, RouterLink, Button],
  templateUrl: './exercise-detail.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseDetailPage {
  private readonly repository = inject(ExerciseRepository);
  private readonly route = inject(ActivatedRoute);

  readonly exercise: Exercise | null = this.repository.findById(
    this.route.snapshot.paramMap.get('id') ?? '',
  );

  type(exercise: Exercise): string {
    return ExerciseTypeTranslations[exercise.exerciseType] ?? exercise.exerciseType;
  }

  muscle(muscle: string): string {
    return MuscleTranslations[muscle as keyof typeof MuscleTranslations] ?? muscle;
  }

  equipment(exercise: Exercise): string {
    return EquipmentTranslations[exercise.equipment] ?? exercise.equipment;
  }

  image(exercise: Exercise): string {
    return exerciseImage(exercise.id);
  }
}
