import { User } from "./auth";

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  projectId: number;
  tasks?: Task[];
}

export type MinimalTag = Pick<Tag, 'id' | 'name' | 'color'>;



export interface Task {
  id: number;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  createdAt: string;
  updatedAt: string;
  position: number;
  columnId: number;
  projectId: number;
  tags: MinimalTag[] | Tag[];
  assignedTo?: User;
}

export interface Column {
  id: number;
  name: string;
  color?: string;
  position: number;
  projectId: number;
  tasks: Task[];
}

export interface Member {
  id: number;
  role: string;
  projectId: number;
  user: User;
} 