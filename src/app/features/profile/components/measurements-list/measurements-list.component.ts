import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { Container } from '../../../../core/components/container/container.component';
import {
  DateRange,
  RangeDate,
} from '../../../../core/modules/form/components/range-date/range-date.component';
import { ModalService } from '../../../../core/modules/modal/services/modal.service';
import { Measurement, MeasurementInput } from '../../interfaces/profile';
import { ProfileService } from '../../services/profile.service';
import { displayDay, today } from '../../utils/date';
import { MeasurementForm } from '../measurement-form/measurement-form.component';
import { Button } from '../../../../core/modules/form/components/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-measurements-list',
  imports: [Container, RangeDate, NgIcon, Button, RouterLink],
  templateUrl: './measurements-list.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasurementsListPage {
  private readonly profileService = inject(ProfileService);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly range = signal<DateRange>({ from: '', to: '' });
  readonly rows = signal<Measurement[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.rows.set(this.profileService.listMeasurements(this.range()));
  }

  changeRange(range: DateRange): void {
    this.range.set(range);
    this.load();
  }

  openForm(measurement?: Measurement): void {
    const row: MeasurementInput = measurement
      ? { ...measurement }
      : {
          profileId: this.profileService.profileId,
          date: today(),
          weight: 0,
          bodyFat: null,
          notes: null,
        };
    const modalId = this.modal.open({
      title: measurement ? 'Editar medición' : 'Nueva medición',
      component: MeasurementForm,
      data: { row },
      okLabel: measurement ? 'Guardar' : 'Agregar',
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.profileService.saveMeasurement(row);
        this.load();
      });
  }

  remove(measurement: Measurement): void {
    const modalId = this.modal.open({
      title: 'Eliminar medición',
      subtitle: `Se eliminará la medición del ${displayDay(measurement.date)}.`,
      type: 'error',
      okLabel: 'Eliminar',
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.profileService.removeMeasurement(measurement.id);
        this.load();
      });
  }

  day(value: string): string {
    return displayDay(value);
  }
}
