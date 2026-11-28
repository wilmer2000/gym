import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Container } from '../../../../core/components/container/container.component';
import { Section } from '../../../../shared/components/section/section.component';
import { GOAL_LABELS, LEVEL_LABELS, SEX_LABELS } from '../../constants/profile.constant';
import { Profile } from '../../interfaces/profile';
import { ProfileService } from '../../services/profile.service';
import { displayDay } from '../../utils/date';
import { Button } from '../../../../core/modules/form/components/button/button.component';

@Component({
  selector: 'app-profile-view',
  imports: [Container, Section, RouterLink, Button],
  templateUrl: './profile-view.component.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileViewPage {
  private readonly profileService = inject(ProfileService);

  readonly profile = signal<Profile | null>(this.profileService.getProfile());
  readonly fullName = computed(() => {
    const profile = this.profile();
    const name = `${profile?.name ?? ''} ${profile?.surname ?? ''}`.trim();

    return name || 'Tu perfil';
  });
  readonly sex = computed(() => this.label(this.profile()?.sex, SEX_LABELS));
  readonly goal = computed(() => this.label(this.profile()?.goal, GOAL_LABELS));
  readonly level = computed(() => this.label(this.profile()?.experienceLevel, LEVEL_LABELS));
  readonly birthDate = computed(
    () => displayDay(this.profile()?.birthDate ?? null) || 'Sin completar',
  );
  readonly height = computed(() => this.unit(this.profile()?.height ?? null, 'cm'));
  readonly targetWeight = computed(() => this.unit(this.profile()?.targetWeight ?? null, 'kg'));
  readonly targetCalories = computed(() =>
    this.unit(this.profile()?.targetCalories ?? null, 'kcal'),
  );
  readonly targetProtein = computed(() => this.unit(this.profile()?.targetProtein ?? null, 'g'));
  readonly days = computed(() => {
    const days = this.profile()?.trainingDaysPerWeek;

    return days ? `${days} días/semana` : 'Sin completar';
  });

  private label<T extends string>(value: T | undefined, labels: Record<T, string>): string {
    return value ? labels[value] : 'Sin completar';
  }

  private unit(value: number | null, unit: string): string {
    return value === null ? 'Sin completar' : `${value} ${unit}`;
  }
}
