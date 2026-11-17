import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EQUIPMENT_LABELS, Exercise, RECORD_TYPE_LABELS } from '../interfaces/exercise';

@Component({
  selector: 'app-exercise-card',
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/exercises', exercise().id]"
      class="card card-hover flex cursor-pointer flex-col gap-2 p-4 text-left"
    >
      <div class="flex items-start justify-between gap-2">
        <h2 class="text-base font-semibold text-primary">{{ exercise().name }}</h2>
        <span class="badge-accent shrink-0">{{ recordType() }}</span>
      </div>

      <p class="text-sm text-text-secondary">{{ exercise().primaryMuscle }}</p>

      @if (exercise().secondaryMuscles.length) {
        <p class="text-xs text-text-muted">+ {{ exercise().secondaryMuscles.join(', ') }}</p>
      }

      <p class="mt-auto text-xs text-text-muted">{{ equipment() }}</p>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseCard {
  exercise = input.required<Exercise>();

  protected equipment = computed(() => EQUIPMENT_LABELS[this.exercise().equipment]);
  protected recordType = computed(() => RECORD_TYPE_LABELS[this.exercise().recordType]);
}
