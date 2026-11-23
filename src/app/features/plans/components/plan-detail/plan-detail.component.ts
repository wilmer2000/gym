import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Container } from '../../../../core/components/container/container.component';
import { Button } from '../../../../core/modules/form/components/button/button.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { ExerciseSelector } from '../../../exercises/components/exercise-selector/exercise-selector.component';
import { Plan, PlanRow } from '../../interfaces/plan';
import { PlanExerciseRepository } from '../../repositories/plan-exercise.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { Section } from '../../../../shared/components/section/section.component';
import { PlanItem } from '../plan-item/plan-item.component';

@Component({
  selector: 'app-plan-detail',
  imports: [Container, RouterLink, FormsModule, Section, Button, ExerciseSelector, PlanItem],
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plan = signal<Plan | null>(null);
  readonly exerciseIds = signal<string[]>([]);
  readonly row = computed<PlanRow | null>(() => {
    const plan = this.plan();

    return plan ? { plan, summary: '', exercises: this.exerciseIds().length } : null;
  });

  constructor() {
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

    this.exerciseIds.set(
      this.planExercises.listByPlan(plan.id).map((exercise) => exercise.exerciseId),
    );
  }
}
