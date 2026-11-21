import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import {
  ExerciseTypeTranslations,
  MuscleTranslations,
  exerciseImage,
} from '../../constants/exercises.constant';
import { Exercise } from '../../interfaces/exercise';
import { ExerciseRepository } from '../../repositories/exercise.repository';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-exercise-selector',
  imports: [Input, FormsModule, NgOptimizedImage],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExerciseSelector),
      multi: true,
    },
  ],
  templateUrl: './exercise-selector.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseSelector implements ControlValueAccessor {
  private readonly repository = inject(ExerciseRepository);

  search = signal('');
  exercises = computed(() =>
    this.repository
      .search({ name: this.search() })
      .sort(
        (a, b) =>
          MuscleTranslations[a.primaryMuscle].localeCompare(MuscleTranslations[b.primaryMuscle]) ||
          a.name.localeCompare(b.name),
      ),
  );

  multiple = input(false);
  selectionChange = output<string[]>();

  // The form drives the value through the CVA; selectionChange stays for direct bindings.
  protected readonly selection = signal<string[]>([]);
  protected readonly disabled = signal(false);
  protected onTouched: () => void = () => {};
  private onChange: (value: string[]) => void = () => {};

  writeValue(value: string[] | null): void {
    this.selection.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  isSelected(id: string): boolean {
    return this.selection().includes(id);
  }

  toggle(exercise: Exercise): void {
    if (this.disabled()) {
      return;
    }

    const selected = this.selection();

    if (!this.multiple()) {
      this.update(selected.includes(exercise.id) ? [] : [exercise.id]);

      return;
    }

    this.update(
      selected.includes(exercise.id)
        ? selected.filter((id) => id !== exercise.id)
        : [...selected, exercise.id],
    );
  }

  muscle(exercise: Exercise): string {
    return MuscleTranslations[exercise.primaryMuscle];
  }

  type(exercise: Exercise): string {
    return ExerciseTypeTranslations[exercise.exerciseType];
  }

  image(exercise: Exercise): string {
    return exerciseImage(exercise.id);
  }

  private update(ids: string[]): void {
    this.selection.set(ids);
    this.selectionChange.emit(ids);
    this.onChange(ids);
    this.onTouched();
  }
}
