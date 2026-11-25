import { Option } from '../../../core/modules/form/interfaces/option';
import { ProfileExperienceLevel, ProfileGoal, ProfileSex } from '../interfaces/profile';

export const SEX_LABELS: Record<ProfileSex, string> = {
  M: 'Masculino',
  F: 'Femenino',
  otro: 'Otro',
};

export const GOAL_LABELS: Record<ProfileGoal, string> = {
  perder_grasa: 'Perder grasa',
  ganar_musculo: 'Ganar músculo',
  mantener: 'Mantener',
};

export const LEVEL_LABELS: Record<ProfileExperienceLevel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export const SEX_OPTIONS: Option[] = Object.entries(SEX_LABELS).map(([id, label]) => ({ id, label }));

export const GOAL_OPTIONS: Option[] = Object.entries(GOAL_LABELS).map(([id, label]) => ({
  id,
  label,
}));

export const LEVEL_OPTIONS: Option[] = Object.entries(LEVEL_LABELS).map(([id, label]) => ({
  id,
  label,
}));
