import { Tag } from './board';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'FEATURE' | 'BUG' | 'TASK' | 'IMPROVEMENT';

export interface TaskFormData {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  startDate: Date | null;
  endDate: Date | null;
  dueDate: Date | null;
  selectedTags: Tag[];
  assignedToId: number | undefined;
}

export interface TaskFormSubmitData {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  tagIds: number[];
  userId: number | undefined;
} 