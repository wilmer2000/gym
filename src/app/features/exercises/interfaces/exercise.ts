export type Equipment =
  'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Band' | 'Other';

export type ExerciseType =
  'weight_reps' | 'bodyweight_reps' | 'duration' | 'distance_duration' | 'assisted_bodyweight';

export type Muscle =
  | 'Back'
  | 'Chest'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Core'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Forearms'
  | 'Hip Flexors';

export interface Exercise {
  id: string;
  name: string;
  exerciseType: ExerciseType;
  equipment: Equipment;
  primaryMuscle: Muscle;
  secondaryMuscles: Muscle[];
  description: string | null;
  createdAt: number;
}
