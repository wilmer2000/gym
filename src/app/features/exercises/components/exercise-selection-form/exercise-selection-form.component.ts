import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { ExerciseSelector } from '../exercise-selector/exercise-selector.component';

export interface ExerciseSelection {
  exerciseId: string;
  sets: number;
  reps: number;
}

// Shown by the modal from plan-exercises. The modal has no return channel, so the
// values are written into the holder it passes as data when the ok button validates.
@Component({
  selector: 'app-exercise-selection-form',
  imports: [ExerciseSelector, Input, FormsModule],
  template: `
    <div class="flex flex-col gap-3">
      <app-exercise-selector [ngModel]="ids()" (ngModelChange)="exerciseId.set($event[0] ?? '')" />

      <div class="flex gap-2">
        <div class="flex items-center gap-2">
          <span>Sets</span>
          <app-input
            class="w-24"
            id="exercise-selection-sets"
            label="Sets"
            type="number"
            min="1"
            [ngModel]="sets()"
            (ngModelChange)="sets.set(+$event)"
          />
        </div>
        <div class="flex items-center gap-2">
          <span>Repeticiones</span>
          <app-input
            class="w-24"
            id="exercise-selection-reps"
            label="Reps"
            type="number"
            min="1"
            [ngModel]="reps()"
            (ngModelChange)="reps.set(+$event)"
          />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseSelectionForm {
  private readonly modal = inject(ModalService);

  readonly data = input.required<{ row: ExerciseSelection }>();

  protected readonly exerciseId = linkedSignal(() => this.data().row.exerciseId);
  protected readonly sets = linkedSignal(() => this.data().row.sets);
  protected readonly reps = linkedSignal(() => this.data().row.reps);
  protected readonly ids = computed(() => (this.exerciseId() ? [this.exerciseId()] : []));
  protected readonly valid = computed(
    () => this.exerciseId() !== '' && this.sets() > 0 && this.reps() > 0,
  );

  constructor() {
    effect(() => {
      const id = this.modal.modal()?.id;

      if (id === undefined) {
        return;
      }

      this.modal.guard(id, () => {
        if (this.valid()) {
          this.data().row = {
            exerciseId: this.exerciseId(),
            sets: this.sets(),
            reps: this.reps(),
          };
        }

        return this.valid();
      });
    });
  }
}
