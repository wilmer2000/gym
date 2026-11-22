import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { DragList } from '../../../../shared/components/drag-list/drag-list.component';
import { Button } from '../../../../core/modules/form/components/button/button.component';
import { Section } from '../../../../shared/components/section/section.component';
import {
  ExerciseSelection,
  ExerciseSelectionForm,
} from '../../../exercises/components/exercise-selection-form/exercise-selection-form.component';
import {
  exerciseImage,
  ExerciseTypeTranslations,
  MuscleTranslations,
} from '../../../exercises/constants/exercises.constant';
import { Exercise } from '../../../exercises/interfaces/exercise';
import { PlanExerciseRow } from '../../interfaces/plan';

@Component({
  selector: 'app-plan-exercises-form',
  imports: [Section, DragList, NgOptimizedImage, Button],
  templateUrl: './plan-exercises.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanExercisesForm {
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly exercises = input.required<Exercise[]>();
  readonly rows = input.required<PlanExerciseRow[]>();

  readonly rowsChange = output<PlanExerciseRow[]>();

  openForm(index?: number): void {
    const row = index === undefined ? null : this.rows()[index];
    const picked: { row: ExerciseSelection } = {
      row: row ?? { exerciseId: '', sets: 3, reps: 12 },
    };
    const modalId = this.modal.open({
      title: row ? 'Editar ejercicio' : 'Agregar ejercicio',
      component: ExerciseSelectionForm,
      data: picked,
      okLabel: row ? 'Guardar' : 'Agregar',
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const rows = [...this.rows()];

        if (index === undefined) {
          rows.push(picked.row);
        } else {
          rows[index] = picked.row;
        }

        this.rowsChange.emit(rows);
      });
  }

  removeRow(index: number): void {
    this.rowsChange.emit(this.rows().filter((_, position) => position !== index));
  }

  name(id: string): string {
    return this.exercise(id)?.name ?? id;
  }

  muscle(id: string): string {
    const exercise = this.exercise(id);

    return exercise ? MuscleTranslations[exercise.primaryMuscle] : '';
  }

  type(id: string): string {
    const exercise = this.exercise(id);

    return exercise ? ExerciseTypeTranslations[exercise.exerciseType] : '';
  }

  image(id: string): string {
    return exerciseImage(id);
  }

  private exercise(id: string): Exercise | undefined {
    return this.exercises().find((exercise) => exercise.id === id);
  }
}
