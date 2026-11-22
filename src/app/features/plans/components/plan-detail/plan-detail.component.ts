import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { Container } from '../../../../core/components/container/container.component';
import { Toggle } from '../../../../core/modules/form/components/toggle/toggle.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { ExerciseRepository } from '../../../exercises/repositories/exercise.repository';
import { Plan } from '../../interfaces/plan';
import { PlanExerciseRepository } from '../../repositories/plan-exercise.repository';
import { PlanWeekdayRepository } from '../../repositories/plan-weekday.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { scheduleSummary } from '../../utils/schedule-summary';
import { Section } from '../../../../shared/components/section/section.component';

@Component({
  selector: 'app-plan-detail',
  imports: [Container, Toggle, RouterLink, FormsModule, Section, NgIcon],
  templateUrl: './plan-detail.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanDetailPage {
  private readonly plans = inject(PlanRepository);
  private readonly planExercises = inject(PlanExerciseRepository);
  private readonly planWeekdays = inject(PlanWeekdayRepository);
  private readonly exerciseRepo = inject(ExerciseRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plan = signal<Plan | null>(null);
  readonly summary = signal('');
  readonly exercises = signal<{ name: string; reps: number; sets: number }[]>([]);

  constructor() {
    this.load();
  }

  toggleActive(active: boolean): void {
    const plan = this.plan();

    if (!plan) {
      return;
    }

    this.plans.setActive(plan.id, active);
    this.load();
  }

  remove(): void {
    const plan = this.plan();

    if (!plan) {
      return;
    }

    const modalId = this.modal.open({
      title: 'Eliminar plan',
      subtitle: `Se eliminará "${plan.name}" y sus días de la semana de forma permanente.`,
      type: 'error',
      okLabel: 'Eliminar',
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.plans.remove(String(plan.id));
        void this.router.navigate(['/plans']);
      });
  }

  private load(): void {
    const plan = this.plans.findById(String(this.route.snapshot.paramMap.get('id') ?? ''));

    this.plan.set(plan);

    if (!plan) {
      return;
    }

    this.summary.set(scheduleSummary(this.planWeekdays.listByPlan(plan.id)));
    this.exercises.set(
      this.planExercises.listByPlan(plan.id).map((exercise) => ({
        name: this.exerciseRepo.findById(exercise.exerciseId)?.name ?? exercise.exerciseId,
        reps: exercise.reps,
        sets: exercise.sets,
      })),
    );
  }
}
