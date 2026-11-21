import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Container } from '../../../../core/components/container/container.component';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { Toggle } from '../../../../core/modules/form/components/toggle/toggle.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { Plan } from '../../interfaces/plan';
import { PlanDateRepository } from '../../repositories/plan-date.repository';
import { PlanExerciseRepository } from '../../repositories/plan-exercise.repository';
import { PlanWeekdayRepository } from '../../repositories/plan-weekday.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { scheduleSummary } from '../../utils/schedule-summary';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-plan-list',
  imports: [Container, Input, Toggle, RouterLink, FormsModule, NgIcon],
  templateUrl: './plan-list.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanListPage {
  private readonly plans = inject(PlanRepository);
  private readonly planExercises = inject(PlanExerciseRepository);
  private readonly weekdays = inject(PlanWeekdayRepository);
  private readonly dates = inject(PlanDateRepository);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly search = signal('');
  readonly onlyActive = signal(false);

  // Repositories are synchronous; bumping this signal re-runs the computed reads.
  private readonly version = signal(0);

  readonly rows = computed(() => {
    this.version();

    return this.plans
      .search({ name: this.search(), active: this.onlyActive() ? true : undefined })
      .map((plan) => ({
        plan,
        summary: scheduleSummary(
          plan,
          this.weekdays.listByPlan(plan.id),
          this.dates.listByPlan(plan.id),
        ),
        exercises: this.planExercises.listByPlan(plan.id).length,
      }));
  });

  toggleActive(plan: Plan): void {
    this.plans.setActive(plan.id, !plan.active);
    this.version.update((value) => value + 1);
  }

  remove(plan: Plan): void {
    const modalId = this.modal.open({
      title: 'Eliminar plan',
      subtitle: `Se eliminará "${plan.name}" y su calendario de forma permanente.`,
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
        this.version.update((value) => value + 1);
      });
  }
}
