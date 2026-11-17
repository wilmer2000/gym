import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ExerciseMedia } from '../interfaces/exercise-media';

// Media row before it is stored: id and exerciseId are assigned on save.
export type MediaDraft = Omit<ExerciseMedia, 'id' | 'exerciseId'>;

@Component({
  selector: 'app-exercise-media-editor',
  template: `
    <div class="flex flex-col gap-2">
      @for (item of items(); track $index) {
        <div class="flex flex-col gap-2 rounded-md border border-border p-2 sm:flex-row">
          <select
            class="select sm:w-36"
            [value]="item.type"
            [attr.aria-label]="'Tipo de contenido ' + ($index + 1)"
            (change)="update($index, { type: $any($event.target).value })"
          >
            <option value="image">Imagen</option>
            <option value="video">Video</option>
            <option value="link">Enlace</option>
          </select>

          <input
            class="input"
            type="url"
            placeholder="https://..."
            [value]="item.url"
            [attr.aria-label]="'URL ' + ($index + 1)"
            (input)="update($index, { url: $any($event.target).value })"
          />

          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="$index === 0"
              aria-label="Subir"
              (click)="move($index, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              [disabled]="$last"
              aria-label="Bajar"
              (click)="move($index, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              aria-label="Quitar"
              (click)="remove($index)"
            >
              ✕
            </button>
          </div>
        </div>
      }

      <button type="button" class="btn btn-secondary btn-sm self-start" (click)="add()">
        Agregar imagen, video o enlace
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseMediaEditor {
  items = input<MediaDraft[]>([]);
  itemsChange = output<MediaDraft[]>();

  add(): void {
    this.itemsChange.emit([
      ...this.items(),
      { type: 'image', url: '', sortOrder: this.items().length, createdAt: Date.now() },
    ]);
  }

  update(index: number, patch: Partial<MediaDraft>): void {
    this.itemsChange.emit(
      this.items().map((item, position) => (position === index ? { ...item, ...patch } : item)),
    );
  }

  remove(index: number): void {
    this.itemsChange.emit(
      this.items()
        .filter((_, position) => position !== index)
        .map((item, position) => ({ ...item, sortOrder: position })),
    );
  }

  move(index: number, offset: number): void {
    const next = [...this.items()];
    const target = index + offset;

    if (target < 0 || target >= next.length) {
      return;
    }

    [next[index], next[target]] = [next[target], next[index]];

    this.itemsChange.emit(next.map((item, position) => ({ ...item, sortOrder: position })));
  }
}
