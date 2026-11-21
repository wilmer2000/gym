import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { ExerciseRepository } from '../../../exercises/repositories/exercise.repository';
import { PlanExerciseRow, PlanInput } from '../../interfaces/plan';
import { PlanExerciseRepository } from '../../repositories/plan-exercise.repository';
import { PlanWeekdayRepository } from '../../repositories/plan-weekday.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { PlanDataForm } from '../plan-data/plan-data.component';
import { PlanExercisesForm } from '../plan-exercises/plan-exercises.component';
import { PlanScheduleForm } from '../plan-schedule/plan-schedule.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-form',
  imports: [Container, PlanDataForm, PlanScheduleForm, PlanExercisesForm, RouterLink, FormsModule],
  templateUrl: './plan-form.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanFormPage {
  private readonly plans = inject(PlanRepository);
  private readonly planExercises = inject(PlanExerciseRepository);
  private readonly planWeekdays = inject(PlanWeekdayRepository);
  private readonly exerciseRepo = inject(ExerciseRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly planId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
  readonly exercises = this.exerciseRepo.listAll();

  private readonly exerciseIds = new Set(this.exercises.map((exercise) => exercise.id));

  readonly name = signal('');
  readonly description = signal('');
  readonly active = signal(true);
  readonly selectedDays = signal<number[]>([]);
  readonly rows = signal<PlanExerciseRow[]>([]);
  readonly error = signal('');

  readonly valid = computed(
    () =>
      this.name().trim().length > 0 &&
      this.selectedDays().length > 0 &&
      this.rows().length > 0 &&
      this.rows().every((row) => row.exerciseId !== '' && row.reps > 0 && row.sets > 0),
  );

  constructor() {
    if (!this.planId) {
      this.rows.set([{ exerciseId: this.exercises[0]?.id ?? '', reps: 10, sets: 3 }]);

      return;
    }

    const plan = this.plans.findById(String(this.planId));

    if (!plan) {
      void this.router.navigate(['/plans']);

      return;
    }

    this.name.set(plan.name);
    this.description.set(plan.description ?? '');
    this.active.set(plan.active);
    this.selectedDays.set(this.planWeekdays.listByPlan(plan.id).map((day) => day.dayOfWeek));
    this.rows.set(
      this.planExercises.listByPlan(plan.id).map((exercise) => ({
        exerciseId: exercise.exerciseId,
        reps: exercise.reps,
        sets: exercise.sets,
      })),
    );
  }

  save(): void {
    if (!this.valid()) {
      this.error.set(
        'Revisá los datos: nombre, al menos un día y al menos un ejercicio con repeticiones.',
      );

      return;
    }

    // exercises live in another DB, so there is no foreign key to lean on.
    if (this.rows().some((row) => !this.exerciseIds.has(row.exerciseId))) {
      this.error.set('El catálogo no contiene uno de los ejercicios elegidos.');

      return;
    }

    const input: PlanInput = {
      id: this.planId || undefined,
      name: this.name().trim(),
      description: this.description().trim() || null,
      active: this.active(),
      exercises: this.rows().map((row) => ({
        exerciseId: row.exerciseId,
        reps: Math.max(1, Math.floor(row.reps)),
        sets: Math.max(1, Math.floor(row.sets)),
      })),
      weekdays: this.selectedDays(),
    };

    const id = this.plans.savePlan(input);

    void this.router.navigate(['/plans', id]);
  }
}
