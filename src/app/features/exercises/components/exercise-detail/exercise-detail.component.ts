import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { Exercise, EQUIPMENT_LABELS } from '../../interfaces/exercise';
import { ExerciseRepository } from '../../repositories/exercise.repository';

@Component({
  selector: 'app-exercise-detail',
  imports: [Container, RouterLink],
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

  protected readonly equipment = computed(() =>
    this.exercise ? EQUIPMENT_LABELS[this.exercise.equipment] : '',
  );
}
