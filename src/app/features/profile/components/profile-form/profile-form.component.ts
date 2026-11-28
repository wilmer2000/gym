import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { Selector } from '../../../../core/modules/form/components/selector/selector.component';
import { Section } from '../../../../shared/components/section/section.component';
import { GOAL_OPTIONS, LEVEL_OPTIONS, SEX_OPTIONS } from '../../constants/profile.constant';
import {
  ProfileExperienceLevel,
  ProfileGoal,
  ProfileSex,
} from '../../interfaces/profile';
import { ProfileService } from '../../services/profile.service';
import { Button } from '../../../../core/modules/form/components/button/button.component';

@Component({
  selector: 'app-profile-form',
  imports: [Container, Section, Input, Selector, FormsModule, RouterLink, Button],
  templateUrl: './profile-form.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormPage {
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private profileId = this.profileService.profileId;

  readonly sexOptions = SEX_OPTIONS;
  readonly goalOptions = GOAL_OPTIONS;
  readonly levelOptions = LEVEL_OPTIONS;

  readonly name = signal('');
  readonly surname = signal('');
  readonly birthDate = signal('');
  readonly sex = signal<ProfileSex>('otro');
  readonly height = signal('');
  readonly goal = signal<ProfileGoal>('mantener');
  readonly experienceLevel = signal<ProfileExperienceLevel>('principiante');
  readonly trainingDaysPerWeek = signal('3');
  readonly targetWeight = signal('');
  readonly targetCalories = signal('');
  readonly targetProtein = signal('');
  readonly error = signal('');

  readonly heightValue = computed(() => this.numeric(this.height()));
  readonly daysValue = computed(() => this.numeric(this.trainingDaysPerWeek()));
  readonly targetWeightValue = computed(() => this.numeric(this.targetWeight()));
  readonly targetCaloriesValue = computed(() => this.numeric(this.targetCalories()));
  readonly targetProteinValue = computed(() => this.numeric(this.targetProtein()));

  readonly heightInvalid = computed(() => {
    const value = this.heightValue();

    return value === null || value < 1 || value > 300;
  });
  readonly daysInvalid = computed(() => {
    const value = this.daysValue();

    return value === null || !Number.isInteger(value) || value < 1 || value > 7;
  });
  readonly targetWeightInvalid = computed(() => (this.targetWeightValue() ?? 0) <= 0);
  readonly targetCaloriesInvalid = computed(() => (this.targetCaloriesValue() ?? 0) <= 0);
  readonly targetProteinInvalid = computed(() => (this.targetProteinValue() ?? 0) <= 0);

  readonly valid = computed(() => {
    const height = this.heightValue();
    const days = this.daysValue();
    const weight = this.targetWeightValue();
    const calories = this.targetCaloriesValue();
    const protein = this.targetProteinValue();

    return (
      this.name().trim() !== '' &&
      this.surname().trim() !== '' &&
      this.birthDate() !== '' &&
      height !== null &&
      height >= 1 &&
      height <= 300 &&
      days !== null &&
      Number.isInteger(days) &&
      days >= 1 &&
      days <= 7 &&
      weight !== null &&
      weight > 0 &&
      calories !== null &&
      calories > 0 &&
      protein !== null &&
      protein > 0
    );
  });

  constructor() {
    const profile = this.profileService.getProfile();

    if (!profile) {
      return;
    }

    this.profileId = profile.id;
    this.name.set(profile.name);
    this.surname.set(profile.surname);
    this.birthDate.set(profile.birthDate ?? '');
    this.sex.set(profile.sex);
    this.height.set(profile.height === null ? '' : String(profile.height));
    this.goal.set(profile.goal);
    this.experienceLevel.set(profile.experienceLevel);
    this.trainingDaysPerWeek.set(String(profile.trainingDaysPerWeek));
    this.targetWeight.set(profile.targetWeight === null ? '' : String(profile.targetWeight));
    this.targetCalories.set(profile.targetCalories === null ? '' : String(profile.targetCalories));
    this.targetProtein.set(profile.targetProtein === null ? '' : String(profile.targetProtein));
  }

  save(): void {
    if (!this.valid()) {
      this.error.set(
        'Completá nombre, apellido, fecha de nacimiento y todos los objetivos con valores válidos.',
      );

      return;
    }

    this.profileService.saveProfile({
      id: this.profileId,
      name: this.name().trim(),
      surname: this.surname().trim(),
      birthDate: this.birthDate(),
      sex: this.sex(),
      height: this.heightValue(),
      goal: this.goal(),
      experienceLevel: this.experienceLevel(),
      trainingDaysPerWeek: Math.round(this.daysValue() ?? 3),
      targetWeight: this.targetWeightValue() ?? 0,
      targetCalories: Math.round(this.targetCaloriesValue() ?? 0),
      targetProtein: Math.round(this.targetProteinValue() ?? 0),
    });

    void this.router.navigate(['/profile']);
  }

  private numeric(value: string): number | null {
    const number = Number(value.replace(',', '.'));

    return value.trim() === '' || !Number.isFinite(number) ? null : number;
  }
}
