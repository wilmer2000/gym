import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Container } from '../../../core/components/container/container.component';
import { ModalService } from '../../../core/modules/modal/services/modal.service';
import { ExerciseForm } from '../components/exercise-form.component';
import { ExerciseMediaGallery } from '../components/exercise-media-gallery.component';
import { EQUIPMENT_LABELS, Exercise, RECORD_TYPE_LABELS } from '../interfaces/exercise';
import { ExerciseMedia } from '../interfaces/exercise-media';
import { ExerciseMediaRepository } from '../repositories/exercise-media.repository';
import { ExerciseRepository } from '../repositories/exercise.repository';

@Component({
  selector: 'app-exercise-detail',
  imports: [Container, ExerciseMediaGallery, RouterLink],
  template: `
    <app-container [title]="exercise()?.name ?? 'Ejercicio'">
      <div header class="flex gap-2">
        <a routerLink="/exercises" class="btn btn-secondary">Volver</a>
        @if (exercise()) {
          <button type="button" class="btn btn-primary" (click)="edit()">Editar</button>
          <button type="button" class="btn btn-ghost text-danger" (click)="remove()">
            Eliminar
          </button>
        }
      </div>

      @if (exercise(); as item) {
        <section class="card">
          <div class="card-body flex flex-col gap-4">
            <dl class="grid gap-4 sm:grid-cols-3">
              <div>
                <dt class="text-xs uppercase text-text-muted">Músculo principal</dt>
                <dd class="text-sm text-primary">{{ item.primaryMuscle }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase text-text-muted">Equipo</dt>
                <dd class="text-sm text-primary">{{ equipment() }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase text-text-muted">Registro</dt>
                <dd class="text-sm text-primary">{{ recordType() }}</dd>
              </div>
            </dl>

            @if (item.secondaryMuscles.length) {
              <div class="flex flex-col gap-1">
                <span class="text-xs uppercase text-text-muted">Músculos secundarios</span>
                <div class="flex flex-wrap gap-1">
                  @for (muscle of item.secondaryMuscles; track $index) {
                    <span class="badge-accent">{{ muscle }}</span>
                  }
                </div>
              </div>
            }

            @if (item.description) {
              <p class="text-sm text-text-secondary">{{ item.description }}</p>
            }

            @if (item.instructions) {
              <div class="flex flex-col gap-1">
                <h2 class="text-sm font-semibold text-primary">Instrucciones</h2>
                <p class="whitespace-pre-line text-sm text-text-secondary">
                  {{ item.instructions }}
                </p>
              </div>
            }

            @if (item.notes) {
              <div class="flex flex-col gap-1">
                <h2 class="text-sm font-semibold text-primary">Notas</h2>
                <p class="whitespace-pre-line text-sm text-text-secondary">{{ item.notes }}</p>
              </div>
            }
          </div>
        </section>

        @if (media().length) {
          <app-exercise-media-gallery [media]="media()" />
        }
      } @else {
        <div class="card card-body flex flex-col items-start gap-3">
          <p class="text-sm text-text-secondary">No se encontró el ejercicio.</p>
          <a routerLink="/exercises" class="btn btn-secondary">Volver al listado</a>
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
export class ExerciseDetailPage {
  private readonly exercises = inject(ExerciseRepository);
  private readonly mediaRepository = inject(ExerciseMediaRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly exercise = signal<Exercise | null>(null);
  readonly media = signal<ExerciseMedia[]>([]);

  protected readonly equipment = computed(() => {
    const exercise = this.exercise();

    return exercise ? EQUIPMENT_LABELS[exercise.equipment] : '';
  });
  protected readonly recordType = computed(() => {
    const exercise = this.exercise();

    return exercise ? RECORD_TYPE_LABELS[exercise.recordType] : '';
  });

  constructor() {
    const exercise = this.exercises.findById(this.route.snapshot.paramMap.get('id') ?? '');

    this.exercise.set(exercise);

    if (exercise) {
      this.media.set(this.mediaRepository.listByExercise(exercise.id));
    }
  }

  edit(): void {
    const exercise = this.exercise();

    if (!exercise) {
      return;
    }

    this.modal.open({
      title: 'Editar ejercicio',
      okLabel: 'Guardar',
      closeLabel: 'Cancelar',
      component: ExerciseForm,
      data: exercise.id,
    });
  }

  remove(): void {
    const exercise = this.exercise();

    if (!exercise) {
      return;
    }

    const modalId = this.modal.open({
      title: 'Eliminar ejercicio',
      subtitle: `Se eliminará "${exercise.name}" y sus imágenes de forma permanente.`,
      type: 'error',
      okLabel: 'Eliminar',
    });

    this.modal.action$
      .pipe(
        filter((event) => event.id === modalId && event.action === 'ok'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.exercises.remove(String(exercise.id));
        void this.router.navigate(['/exercises']);
      });
  }
}
