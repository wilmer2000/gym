import { Option } from '../../../core/modules/form/interfaces/option';
import { Equipment, ExerciseType, Muscle } from '../interfaces/exercise';

export const MuscleTranslations: Record<Muscle, string> = {
  Back: 'Espalda',
  Chest: 'Pecho',
  Shoulders: 'Hombros',
  Biceps: 'Bíceps',
  Triceps: 'Tríceps',
  Core: 'Zona Media',
  Quadriceps: 'Cuádriceps',
  Hamstrings: 'Isquios',
  Glutes: 'Glúteos',
  Calves: 'Gemelos',
  Forearms: 'Antebrazos',
  'Hip Flexors': 'Flexores de cadera',
};

export const ExerciseTypeTranslations: Record<ExerciseType, string> = {
  weight_reps: 'Peso y Reps',
  bodyweight_reps: 'Peso Corporal',
  duration: 'Por Tiempo',
  distance_duration: 'Distancia y Tiempo',
  assisted_bodyweight: 'Asistido',
};

export const ExerciseTypeIcons: Record<ExerciseType, string> = {
  weight_reps: 'hugeDumbbell03',
  bodyweight_reps: 'hugeBodyPartMuscle',
  duration: 'hugeStopWatch',
  distance_duration: 'hugeTimer02',
  assisted_bodyweight: 'hugeEquipmentChestPress',
};

export const EquipmentTranslations: Record<Equipment, string> = {
  Barbell: 'Barra',
  Dumbbell: 'Mancuerna',
  Machine: 'Máquina',
  Cable: 'Polea',
  Bodyweight: 'Peso Corporal',
  Kettlebell: 'Pesa Rusa',
  Band: 'Banda Elástica',
  Other: 'Otro',
};

export const EquipmentIcons: Record<Equipment, string> = {
  Barbell: 'hugeEquipmentGym03',
  Dumbbell: 'hugeDumbbell02',
  Machine: 'hugeEquipmentChestPress',
  Cable: 'hugeEquipmentWeightlifting',
  Bodyweight: 'hugeBodyPartMuscle',
  Kettlebell: 'hugeKettlebell',
  Band: 'hugeSkippingRope',
  Other: 'hugeWorkoutStretching',
};

export const MUSCLE_OPTIONS: Option[] = (Object.keys(MuscleTranslations) as Muscle[]).map((k) => ({
  id: k,
  label: MuscleTranslations[k],
}));

export const EXERCISE_OPTIONS: Option[] = (
  Object.keys(ExerciseTypeTranslations) as ExerciseType[]
).map((k) => ({ id: k, label: ExerciseTypeTranslations[k] }));

export const EQUIPMENT_OPTIONS: Option[] = (Object.keys(EquipmentTranslations) as Equipment[]).map(
  (k) => ({ id: k, label: EquipmentTranslations[k] }),
);

// The library has no high-pulley fly, so this one shares its generic cable fly frame.
const IMAGE_SLUGS: Record<string, string> = { 'high-cable-fly': 'cable-fly' };

export function exerciseImage(id: string, frame: 1 | 2 | 3 = 1): string {
  return `assets/${IMAGE_SLUGS[id] ?? id}/frame-${frame}.png`;
}
