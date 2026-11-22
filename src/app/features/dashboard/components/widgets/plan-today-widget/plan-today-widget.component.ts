import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { Section } from '../../../../../shared/components/section/section.component';
import { PlanItem } from '../../../../plans/components/plan-item/plan-item.component';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-plan-today-widget',
  imports: [Section, PlanItem],
  template: `
    <app-section [title]="'Hoy'">
      @if (rows().length) {
        @for (row of rows(); track row.plan.id) {
          <app-plan-item [row]="row" />
        }
      } @else {
        <p class="text-sm italic text-gray-600">No active plans for today</p>
      }
    </app-section>
  `,
})
export class PlanTodayWidget {
  rows = inject(DashboardService).rows;
}
