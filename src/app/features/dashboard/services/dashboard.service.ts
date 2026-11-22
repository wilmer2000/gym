import { computed, inject, Injectable } from '@angular/core';
import { PlanExerciseRepository } from '../../plans/repositories/plan-exercise.repository';
import { PlanRepository } from '../../plans/repositories/plan.repository';
import { PlanWeekdayRepository } from '../../plans/repositories/plan-weekday.repository';
import { scheduleSummary } from '../../plans/utils/schedule-summary';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly planRepository = inject(PlanRepository);
  private readonly planWeekdayRepository = inject(PlanWeekdayRepository);
  private readonly planExerciseRepository = inject(PlanExerciseRepository);

  plansToday = computed(() => {
    const today = new Date().getDay();
    return this.planRepository
      .listActive()
      .filter((plan) =>
        this.planWeekdayRepository
          .listByPlan(plan.id)
          .some((weekday) => weekday.dayOfWeek === today),
      );
  });

  rows = computed(() => {
    return this.plansToday().map((plan) => {
      const weekdays = this.planWeekdayRepository.listByPlan(plan.id);
      return {
        plan,
        summary: scheduleSummary(weekdays),
        exercises: this.planExerciseRepository.listByPlan(plan.id).length,
      };
    });
  });

  dayOfWeeks = computed(() => [
    ...new Set(
      this.planRepository
        .listActive()
        .flatMap((plan) =>
          this.planWeekdayRepository.listByPlan(plan.id).map((weekday) => weekday.dayOfWeek),
        ),
    ),
  ]);
}
