import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { Toggle } from '../../../../core/modules/form/components/toggle/toggle.component';
import { PlanRow } from '../../interfaces/plan';
import { PlanExerciseRepository } from '../../repositories/plan-exercise.repository';
import { PlanWeekdayRepository } from '../../repositories/plan-weekday.repository';
import { PlanRepository } from '../../repositories/plan.repository';
import { scheduleSummary } from '../../utils/schedule-summary';
import { PlanItem } from '../plan-item/plan-item.component';
import { Button } from '../../../../core/modules/form/components/button/button.component';

@Component({
  selector: 'app-plan-list',
  imports: [Container, Input, Toggle, RouterLink, FormsModule, PlanItem, Button],
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

  readonly search = signal('');
  readonly onlyActive = signal(false);
  readonly rows = signal<PlanRow[]>([]);

  constructor() {
    effect(() => this.load());
  }

  protected load(): void {
    this.rows.set(
      this.plans
        .search({ name: this.search(), active: this.onlyActive() ? true : undefined })
        .map((plan) => ({
          plan,
          summary: scheduleSummary(this.weekdays.listByPlan(plan.id)),
          exercises: this.planExercises.listByPlan(plan.id).length,
        })),
    );
  }
}
