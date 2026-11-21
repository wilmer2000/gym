import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
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
  imports: [Section, CdkDrag, CdkDropList, NgOptimizedImage, NgIcon],
  templateUrl: './plan-exercises.component.html',
  styles: `
    :host {
      display: block;
    }

    /* The preview is moved to body, but keeps the component's scope attribute. Its
       width comes from CDK (the row's size); overriding it breaks the flex layout. */
    .cdk-drag-preview {
      border-radius: 0.75rem;
      background-color: var(--color-gray-700);
      overflow: hidden;
    }

    /* The action buttons are irrelevant while dragging. */
    .cdk-drag-preview button {
      display: none;
    }

    /* Ghost slot: CDK clones the row, so hide its content and keep the space. */
    .cdk-drag-placeholder {
      background-color: var(--color-gray-700);
      border: 1px dashed var(--color-gray-500);
      border-radius: 0.75rem;
    }

    .cdk-drag-placeholder > * {
      visibility: hidden;
    }

    .cdk-drag-animating,
    .cdk-drop-list-dragging > *:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
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

  drop(event: CdkDragDrop<PlanExerciseRow[]>): void {
    const rows = [...this.rows()];

    moveItemInArray(rows, event.previousIndex, event.currentIndex);
    this.rowsChange.emit(rows);
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
