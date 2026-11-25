import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { TextArea } from '../../../../core/modules/form/components/text-area/text-area.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { MeasurementInput } from '../../interfaces/profile';

// Shown by the measurements modal. The modal has no return channel, so the
// edited values are written into the holder it passes as data on ok.
@Component({
  selector: 'app-measurement-form',
  imports: [Input, TextArea, FormsModule],
  template: `
    <div class="flex flex-col gap-3">
      <app-input
        id="measurement-date"
        label="Fecha"
        type="date"
        [invalid]="date() === ''"
        [ngModel]="date()"
        (ngModelChange)="date.set($event)"
      />

      <app-input
        id="measurement-weight"
        label="Peso (kg)"
        type="number"
        min="0"
        [invalid]="weightInvalid()"
        [ngModel]="weight()"
        (ngModelChange)="weight.set($event)"
      />

      <app-input
        id="measurement-body-fat"
        label="% de grasa (opcional)"
        type="number"
        min="0"
        max="100"
        [invalid]="bodyFatInvalid()"
        [ngModel]="bodyFat()"
        (ngModelChange)="bodyFat.set($event)"
      />

      <app-text-area
        id="measurement-notes"
        label="Notas (opcional)"
        [ngModel]="notes()"
        (ngModelChange)="notes.set($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementForm {
  private readonly modal = inject(ModalService);

  readonly data = input.required<{ row: MeasurementInput }>();

  protected readonly date = linkedSignal(() => this.data().row.date);
  protected readonly weight = linkedSignal(() =>
    this.data().row.weight > 0 ? String(this.data().row.weight) : '',
  );
  protected readonly bodyFat = linkedSignal(() =>
    this.data().row.bodyFat === null ? '' : String(this.data().row.bodyFat),
  );
  protected readonly notes = linkedSignal(() => this.data().row.notes ?? '');

  protected readonly weightInvalid = computed(() => {
    const value = Number(this.weight());

    return this.weight().trim() === '' || value <= 0;
  });
  protected readonly bodyFatInvalid = computed(() => {
    if (this.bodyFat().trim() === '') {
      return false;
    }

    const value = Number(this.bodyFat());

    return value < 0 || value > 100;
  });
  protected readonly valid = computed(
    () => this.date() !== '' && !this.weightInvalid() && !this.bodyFatInvalid(),
  );

  constructor() {
    effect(() => {
      const id = this.modal.modal()?.id;

      if (id === undefined) {
        return;
      }

      this.modal.guard(id, () => {
        if (this.valid()) {
          this.data().row = {
            id: this.data().row.id,
            profileId: this.data().row.profileId,
            date: this.date(),
            weight: Number(this.weight()),
            bodyFat: this.bodyFat().trim() === '' ? null : Number(this.bodyFat()),
            notes: this.notes().trim() || null,
          };
        }

        return this.valid();
      });
    });
  }
}
