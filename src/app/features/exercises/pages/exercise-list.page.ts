import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Container } from '../../../core/components/container/container.component';
import {
  Filter,
  Filters,
  Selections,
} from '../../../core/modules/filters/components/filters.component';
import { Input } from '../../../core/modules/form/components/input/input.component';
import { Option } from '../../../core/modules/form/interfaces/option';
import { ModalService } from '../../../core/modules/modal/services/modal.service';
import { ExerciseCard } from '../components/exercise-card.component';
import { ExerciseForm } from '../components/exercise-form.component';
import { EQUIPMENT_LABELS, Equipment } from '../interfaces/exercise';
import { ExerciseRepository } from '../repositories/exercise.repository';

@Component({
  selector: 'app-exercise-list',
  imports: [Container, Filters, Input, ExerciseCard, FormsModule],
  template: `
    <app-container title="Ejercicios" subtitle="Tu biblioteca de ejercicios">
      <div header class="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div class="w-full lg:w-64">
          <app-input
            [id]="'exercise-search'"
            placeholder="Buscar por nombre"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
        </div>

        <button type="button" class="btn btn-primary" (click)="openForm()">Nuevo ejercicio</button>
      </div>

      <app-filters [filters]="filters" (selectionChange)="selections.set($event)" />

      @if (exercises().length) {
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          @for (exercise of exercises(); track exercise.id) {
            <app-exercise-card [exercise]="exercise" />
          }
        </div>
      } @else {
        <div class="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p class="text-sm text-text-secondary">
            {{
              hasFilters()
                ? 'No hay ejercicios que coincidan con la búsqueda.'
                : 'Todavía no hay ejercicios.'
            }}
          </p>

          @if (!hasFilters()) {
            <button type="button" class="btn btn-primary" (click)="openForm()">
              Crear el primero
            </button>
          }
        </div>
      }
    </app-container>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseListPage {
  private readonly repository = inject(ExerciseRepository);
  private readonly modal = inject(ModalService);

  readonly search = signal('');
  readonly selections = signal<Selections>({});

  private readonly stored = this.repository.findAll();
  private readonly muscleOptions: Option[] = [
    { id: '', label: 'Todos' },
    ...[...new Set(this.stored.map((exercise) => exercise.primaryMuscle))]
      .sort()
      .map((muscle) => ({ id: muscle, label: muscle })),
  ];
  private readonly equipmentOptions: Option[] = [
    { id: '', label: 'Todo el equipo' },
    ...(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((id) => ({
      id,
      label: EQUIPMENT_LABELS[id],
    })),
  ];

  readonly filters: Filter[] = [
    { id: 'muscle', title: 'Músculo', type: 'single', options: this.muscleOptions },
    { id: 'equipment', title: 'Equipo', type: 'single', options: this.equipmentOptions },
  ];

  readonly hasFilters = computed(
    () => !!this.search().trim() || !!this.selection('muscle') || !!this.selection('equipment'),
  );

  readonly exercises = computed(() =>
    this.repository.search(this.search(), {
      primaryMuscle: this.selection('muscle') || undefined,
      equipment: (this.selection('equipment') || undefined) as Equipment | undefined,
    }),
  );

  openForm(): void {
    this.modal.open({
      title: 'Nuevo ejercicio',
      okLabel: 'Guardar',
      closeLabel: 'Cancelar',
      component: ExerciseForm,
    });
  }

  private selection(id: string): string {
    return this.selections()[id]?.[0] ?? '';
  }
}
