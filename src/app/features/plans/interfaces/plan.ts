export interface Plan {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PlanExercise {
  id: number;
  planId: number;
  exerciseId: string;
  reps: number;
  sets: number;
  sortOrder: number;
}

export interface PlanWeekday {
  id: number;
  planId: number;
  dayOfWeek: number;
}

export interface PlanExerciseRow {
  exerciseId: string;
  reps: number;
  sets: number;
}

// What the form hands to PlanRepository.savePlan() in one transaction.
export interface PlanInput {
  id?: number;
  name: string;
  description: string | null;
  active: boolean;
  exercises: PlanExerciseRow[];
  weekdays: number[];
}

// Monday-first, the order the calendar summary shows. 0 = Sunday in SQLite.
export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];
