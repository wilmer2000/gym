export type MediaType = 'image' | 'video' | 'link';

export interface ExerciseMedia {
  id: number;
  exerciseId: number;
  type: MediaType;
  url: string;
  sortOrder: number;
  createdAt: number;
}
