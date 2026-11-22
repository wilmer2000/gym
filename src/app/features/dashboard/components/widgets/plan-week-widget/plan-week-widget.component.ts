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
        <app-week [days]="dayOfWeeks()" />
      } @else {
        <p class="text-sm italic text-gray-600">No plans this week</p>
      }
    </app-section>
  `,
})
export class PlanWeekWidget {
  dayOfWeeks = inject(DashboardService).dayOfWeeks;
}
