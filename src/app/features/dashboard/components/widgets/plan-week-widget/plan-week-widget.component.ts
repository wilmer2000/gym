import { Component, inject } from '@angular/core';
import { Section } from '../../../../../shared/components/section/section.component';
import { Week } from '../../../../../shared/components/week/week.component';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-plan-week-widget',
  imports: [Section, Week],
  template: `
    <app-section [title]="'Esta semana'">
      @if (dayOfWeeks().length) {
        <app-week [days]="dayOfWeeks()" [small]="false" />
      } @else {
        <p class="text-sm text-gray-600 text-center">No hay planes para esta semana</p>
      }
    </app-section>
  `,
})
export class PlanWeekWidget {
  dayOfWeeks = inject(DashboardService).dayOfWeeks;
}
