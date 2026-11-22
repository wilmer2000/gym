import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { Toggle } from '../../../../core/modules/form/components/toggle/toggle.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { PlanRow } from '../../interfaces/plan';
import { PlanRepository } from '../../repositories/plan.repository';
import { PlanWeekdayRepository } from '../../repositories/plan-weekday.repository';
import { Week } from '../../../../shared/components/week/week.component';

@Component({
  selector: 'app-plan-item',
  imports: [Toggle, Week, RouterLink, FormsModule, NgIcon],
  template: `
    @let item = row();

    <div
      class="flex rounded-2xl bg-gray-700/30 p-3 cursor-pointer"
      [routerLink]="['/plans', item.plan.id]"
    >
      <div class="flex flex-col gap-1 w-full">
        <div class="flex justify-between w-full gap-2">
          <p class="font-medium">{{ item.plan.name }}</p>
          <div>
            <app-toggle
              [id]="'plan-' + item.plan.id"
              [ngModel]="item.plan.active"
              (ngModelChange)="toggleActive($event)"
            />
          </div>
        </div>

        <div class="flex justify-between items-center w-full gap-2">
          <div class="flex flex-col gap-2">
            <app-week [days]="days()" />
            <p>{{ item.exercises }} ejercicio{{ item.exercises === 1 ? '' : 's' }}</p>
            @if (item.plan.description) {
              <p>{{ item.plan.description }}</p>
            }
          </div>

          <button type="button" (click)="remove()">
            <ng-icon name="hugeDelete01" />
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanItem {
  private readonly plans = inject(PlanRepository);
  private readonly weekdays = inject(PlanWeekdayRepository);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly row = input.required<PlanRow>();
  readonly changed = output<void>();

  readonly days = computed(() =>
    this.weekdays.listByPlan(this.row().plan.id).map((day) => day.dayOfWeek),
  );

  toggleActive(active: boolean): void {
    this.plans.setActive(this.row().plan.id, active);
    this.changed.emit();
  }

  remove(): void {
    const plan = this.row().plan;
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
        this.changed.emit();
      });
  }
}
