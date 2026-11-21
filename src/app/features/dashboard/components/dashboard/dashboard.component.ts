import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Container } from '../../../../core/components/container/container.component';

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
  imports: [Container],
})
export class DashboardPage {}
