export type ProfileSex = 'M' | 'F' | 'otro';

export type ProfileGoal = 'perder_grasa' | 'ganar_musculo' | 'mantener';

export type ProfileExperienceLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Profile {
  id: number;
  name: string;
  surname: string;
  birthDate: string | null;
  sex: ProfileSex;
  height: number | null;
  goal: ProfileGoal;
  experienceLevel: ProfileExperienceLevel;
  trainingDaysPerWeek: number;
  targetWeight: number | null;
  targetCalories: number | null;
  targetProtein: number | null;
}

export interface Measurement {
  id: number;
  profileId: number;
  date: string;
  weight: number;
  bodyFat: number | null;
  notes: string | null;
}

export type MeasurementInput = Omit<Measurement, 'id'> & { id?: number };
