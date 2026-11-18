export type Equipment =
  'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band' | 'other';

export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: Equipment;
  description: string | null;
  createdAt: number;
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  cable: 'Polea',
  bodyweight: 'Peso corporal',
  band: 'Banda elástica',
  other: 'Otro',
};
