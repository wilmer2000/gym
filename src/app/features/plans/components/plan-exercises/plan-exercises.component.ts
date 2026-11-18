import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { MuscleTranslations } from '../../../exercises/constants/exercises.constant';
import { Exercise } from '../../../exercises/interfaces/exercise';
import { PlanExerciseRow } from '../../interfaces/plan';

@Component({
  selector: 'app-plan-exercises-form',
  imports: [Input, FormsModule],
  templateUrl: './plan-exercises.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanExercisesForm {
  readonly exercises = input.required<Exercise[]>();
  readonly rows = input.required<PlanExerciseRow[]>();

  readonly rowsChange = output<PlanExerciseRow[]>();

  muscle(exercise: Exercise): string {
    return MuscleTranslations[exercise.primaryMuscle] ?? exercise.primaryMuscle;
  }

  addRow(): void {
    this.rowsChange.emit([
      ...this.rows(),
      { exerciseId: this.exercises()[0]?.id ?? '', reps: 12, sets: 3 },
    ]);
  }

  removeRow(index: number): void {
    this.rowsChange.emit(this.rows().filter((_, position) => position !== index));
  }

  move(index: number, offset: number): void {
    const rows = [...this.rows()];
    const target = index + offset;

    if (target < 0 || target >= rows.length) {
      return;
    }

    [rows[index], rows[target]] = [rows[target], rows[index]];
    this.rowsChange.emit(rows);
  }

  setExercise(index: number, event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    this.rowsChange.emit(
      this.rows().map((row, position) => (position === index ? { ...row, exerciseId: id } : row)),
    );
  }

  setReps(index: number, value: string): void {
    const reps = Number(value);

    this.rowsChange.emit(
      this.rows().map((row, position) =>
        position === index ? { ...row, reps: Number.isFinite(reps) ? reps : 0 } : row,
      ),
    );
  }

  setSets(index: number, value: string): void {
    const sets = Number(value);

    this.rowsChange.emit(
      this.rows().map((row, position) =>
        position === index ? { ...row, sets: Number.isFinite(sets) ? sets : 0 } : row,
      ),
    );
  }
}
