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
import {
  EquipmentTranslations,
  ExerciseTypeTranslations,
  MuscleTranslations,
  exerciseImage,
} from '../../constants/exercises.constant';
import { Exercise } from '../../interfaces/exercise';
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
    ...new Set(this.repository.listAll().map((exercise) => exercise.primaryMuscle)),
  ].sort();

  readonly filters: Filter[] = [
    {
      id: 'muscle',
      title: 'Músculo',
      type: 'single',
      options: [
        { id: '', label: 'Todos' },
        ...this.muscles.map((id) => ({ id, label: MuscleTranslations[id] ?? id })),
      ],
    },
  ];

  readonly exercises = computed(() =>
    this.repository.search({ name: this.search(), primaryMuscle: this.selection('muscle') }),
  );

  readonly groups = computed(() => {
    const groups = new Map<string, Exercise[]>();

    for (const exercise of this.exercises()) {
      groups.set(exercise.primaryMuscle, [...(groups.get(exercise.primaryMuscle) ?? []), exercise]);
    }

    return [...groups]
      .map(([muscle, exercises]) => ({
        muscle,
        label: MuscleTranslations[muscle as keyof typeof MuscleTranslations] ?? muscle,
        exercises,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly hasFilters = computed(() => !!this.search().trim() || !!this.selection('muscle'));

  equipment(exercise: Exercise): string {
    return EquipmentTranslations[exercise.equipment];
  }

  image(exercise: Exercise): string {
    return exerciseImage(exercise.id);
  }

  type(exercise: Exercise): string {
    return ExerciseTypeTranslations[exercise.exerciseType];
  }

  private selection(id: string): string {
    return this.selections()[id]?.[0] ?? '';
  }
}
