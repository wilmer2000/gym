import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Container } from '../../../../core/components/container/container.component';
import { ActionsWidget } from '../widgets/actions-widget/actions-widget.component';
import { PlanTodayWidget } from '../widgets/plan-today-widget/plan-today-widget.component';
import { PlanWeekWidget } from '../widgets/plan-week-widget/plan-week-widget.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, ActionsWidget, PlanTodayWidget, PlanWeekWidget],
})
export class DashboardPage {}
