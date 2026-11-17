export type RecordType = 'weight_reps' | 'bodyweight_reps' | 'time' | 'distance' | 'rounds';
export type Equipment =
  'barbell' | 'dumbbell' | 'machine' | 'cable' | 'band' | 'kettlebell' | 'bodyweight' | 'other';

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: Equipment;
  recordType: RecordType;
  instructions: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  cable: 'Polea',
  band: 'Banda elástica',
  kettlebell: 'Pesa rusa',
  bodyweight: 'Peso corporal',
  other: 'Otro',
};

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  weight_reps: 'Peso y reps',
  bodyweight_reps: 'Repeticiones',
  time: 'Tiempo',
  distance: 'Distancia',
  rounds: 'Rondas',
};
