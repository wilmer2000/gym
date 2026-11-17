import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Input } from '../../../core/modules/form/components/input/input.component';
import { Selector } from '../../../core/modules/form/components/selector/selector.component';
import { TextArea } from '../../../core/modules/form/components/text-area/text-area.component';
import { Option } from '../../../core/modules/form/interfaces/option';
import { ModalService } from '../../../core/modules/modal/services/modal.service';
import { ExerciseMediaEditor, MediaDraft } from './exercise-media-editor.component';
import {
  EQUIPMENT_LABELS,
  Equipment,
  Exercise,
  RECORD_TYPE_LABELS,
  RecordType,
} from '../interfaces/exercise';
import { ExerciseMedia } from '../interfaces/exercise-media';
import { ExerciseMediaRepository } from '../repositories/exercise-media.repository';
import { ExerciseRepository } from '../repositories/exercise.repository';

@Component({
  selector: 'app-exercise-form',
  imports: [Input, Selector, TextArea, ExerciseMediaEditor, FormsModule],
  template: `
    <form class="flex w-full flex-col gap-4" (ngSubmit)="modal.trigger('ok')">
      <app-input
        [id]="'exercise-name'"
        name="name"
        label="Nombre"
        placeholder="Ej. Sentadilla"
        [ngModel]="name()"
        (ngModelChange)="name.set($event)"
        [invalid]="nameInvalid()"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <app-input
          [id]="'exercise-primary-muscle'"
          name="primaryMuscle"
          label="Músculo principal"
          placeholder="Ej. Cuádriceps"
          [ngModel]="primaryMuscle()"
          (ngModelChange)="primaryMuscle.set($event)"
          [invalid]="primaryMuscleInvalid()"
        />
        <app-input
          [id]="'exercise-secondary-muscles'"
          name="secondaryMuscles"
          label="Músculos secundarios"
          placeholder="Separados por coma"
          [ngModel]="secondaryMuscles()"
          (ngModelChange)="secondaryMuscles.set($event)"
        />
      </div>

      @if (secondaryList().length) {
        <div class="flex flex-wrap gap-1">
          @for (muscle of secondaryList(); track $index) {
            <span class="badge-accent">{{ muscle }}</span>
          }
        </div>
      }

      <div class="grid gap-4 sm:grid-cols-2">
        <app-selector
          [id]="'exercise-equipment'"
          name="equipment"
          label="Equipo"
          [options]="equipmentOptions"
          [ngModel]="equipment()"
          (ngModelChange)="equipment.set($any($event))"
        />
        <app-selector
          [id]="'exercise-record-type'"
          name="recordType"
          label="Tipo de registro"
          [options]="recordTypeOptions"
          [ngModel]="recordType()"
          (ngModelChange)="recordType.set($any($event))"
        />
      </div>

      <app-text-area
        [id]="'exercise-description'"
        name="description"
        label="Descripción"
        [ngModel]="description()"
        (ngModelChange)="description.set($event)"
      />
      <app-text-area
        [id]="'exercise-instructions'"
        name="instructions"
        label="Instrucciones"
        [rows]="4"
        [ngModel]="instructions()"
        (ngModelChange)="instructions.set($event)"
      />
      <app-text-area
        [id]="'exercise-notes'"
        name="notes"
        label="Notas"
        [ngModel]="notes()"
        (ngModelChange)="notes.set($event)"
      />

      <div class="flex flex-col gap-2">
        <span class="label">Imágenes, videos y enlaces</span>
        <app-exercise-media-editor [items]="media()" (itemsChange)="media.set($event)" />
      </div>
    </form>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseForm {
  private readonly exercises = inject(ExerciseRepository);
  private readonly mediaRepository = inject(ExerciseMediaRepository);
  private readonly router = inject(Router);
  readonly modal = inject(ModalService);

  private readonly exerciseId = Number(this.modal.modal()?.data);
  readonly id = Number.isInteger(this.exerciseId) && this.exerciseId > 0 ? this.exerciseId : null;

  private readonly existing = this.id ? this.exercises.findById(String(this.id)) : null;

  readonly name = signal(this.existing?.name ?? '');
  readonly primaryMuscle = signal(this.existing?.primaryMuscle ?? '');
  readonly secondaryMuscles = signal(this.existing?.secondaryMuscles.join(', ') ?? '');
  readonly equipment = signal<Equipment>(this.existing?.equipment ?? 'barbell');
  readonly recordType = signal<RecordType>(this.existing?.recordType ?? 'weight_reps');
  readonly description = signal(this.existing?.description ?? '');
  readonly instructions = signal(this.existing?.instructions ?? '');
  readonly notes = signal(this.existing?.notes ?? '');
  readonly media = signal<MediaDraft[]>(this.loadMedia());
  readonly submitted = signal(false);

  readonly equipmentOptions: Option[] = (Object.keys(EQUIPMENT_LABELS) as Equipment[]).map(
    (id) => ({
      id,
      label: EQUIPMENT_LABELS[id],
    }),
  );
  readonly recordTypeOptions: Option[] = (Object.keys(RECORD_TYPE_LABELS) as RecordType[]).map(
    (id) => ({ id, label: RECORD_TYPE_LABELS[id] }),
  );

  readonly secondaryList = computed(() =>
    this.secondaryMuscles()
      .split(',')
      .map((muscle) => muscle.trim())
      .filter(Boolean),
  );
  readonly nameInvalid = computed(() => this.submitted() && !this.name().trim());
  readonly primaryMuscleInvalid = computed(() => this.submitted() && !this.primaryMuscle().trim());

  constructor() {
    const modalId = this.modal.modal()?.id;

    if (modalId !== undefined) {
      this.modal.guard(modalId, () => this.save());
    }
  }

  private save(): boolean {
    this.submitted.set(true);

    if (!this.name().trim() || !this.primaryMuscle().trim()) {
      return false;
    }

    const now = Date.now();
    const exercise: Exercise = {
      id: this.id ?? 0,
      name: this.name().trim(),
      description: this.description().trim() || null,
      primaryMuscle: this.primaryMuscle().trim(),
      secondaryMuscles: this.secondaryList(),
      equipment: this.equipment(),
      recordType: this.recordType(),
      instructions: this.instructions().trim() || null,
      notes: this.notes().trim() || null,
      createdAt: this.existing?.createdAt ?? now,
      updatedAt: now,
    };
    const media: ExerciseMedia[] = this.media()
      .filter((item) => item.url.trim())
      .map((item, position) => ({
        id: 0,
        exerciseId: exercise.id,
        type: item.type,
        url: item.url.trim(),
        sortOrder: position,
        createdAt: item.createdAt,
      }));

    this.exercises.saveWithMedia(exercise, media);
    void this.router.navigate(['/exercises']);

    return true;
  }

  private loadMedia(): MediaDraft[] {
    if (!this.id) {
      return [];
    }

    return this.mediaRepository.listByExercise(this.id).map((item) => ({
      type: item.type,
      url: item.url,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
    }));
  }
}
