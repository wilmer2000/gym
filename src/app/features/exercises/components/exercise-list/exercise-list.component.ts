import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import {
  Filter,
  Filters,
  Selections,
} from '../../../../core/modules/filters/components/filters.component';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { Exercise, EQUIPMENT_LABELS } from '../../interfaces/exercise';
import { ExerciseRepository } from '../../repositories/exercise.repository';

@Component({
  selector: 'app-exercise-list',
  imports: [Container, Filters, Input, RouterLink, FormsModule],
  templateUrl: './exercise-list.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseListPage {
  private readonly repository = inject(ExerciseRepository);

  readonly search = signal('');
  readonly selections = signal<Selections>({});

  private readonly muscles = [
    ...new Set(this.repository.listAll().map((e) => e.muscleGroup)),
  ].sort();

  readonly filters: Filter[] = [
    {
      id: 'muscle',
      title: 'Músculo',
      type: 'single',
      options: [{ id: '', label: 'Todos' }, ...this.muscles.map((id) => ({ id, label: id }))],
    },
  ];

  readonly exercises = computed(() =>
    this.repository.search({ name: this.search(), muscleGroup: this.selection('muscle') }),
  );
  readonly hasFilters = computed(() => !!this.search().trim() || !!this.selection('muscle'));

  equipment(exercise: Exercise): string {
    return EQUIPMENT_LABELS[exercise.equipment];
  }

  private selection(id: string): string {
    return this.selections()[id]?.[0] ?? '';
  }
}
