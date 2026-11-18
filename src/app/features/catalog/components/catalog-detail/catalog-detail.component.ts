import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { CatalogExercise, EQUIPMENT_LABELS } from '../../interfaces/exercise';
import { CatalogExerciseRepository } from '../../repositories/catalog-exercise.repository';

@Component({
  selector: 'app-catalog-detail',
  imports: [Container, RouterLink],
  templateUrl: './catalog-detail.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogDetailPage {
  private readonly repository = inject(CatalogExerciseRepository);
  private readonly route = inject(ActivatedRoute);

  readonly exercise: CatalogExercise | null = this.repository.findById(
    this.route.snapshot.paramMap.get('id') ?? '',
  );

  protected readonly equipment = computed(() =>
    this.exercise ? EQUIPMENT_LABELS[this.exercise.equipment] : '',
  );
}
