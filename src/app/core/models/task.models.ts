export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskResponseDTO {
  id: number;
  title: string;
  estimateHours: number;
  assignee?: string | null;
  status: TaskStatus;
  createdAt: string; 
  finishedAt?: string | null;
}

export interface CreateTaskRequestDTO {
  title: string;
  estimateHours: number;
  assignee?: string | null;
  status: TaskStatus;
}

export interface ChangeTaskStatusRequestDTO {
  newStatus: TaskStatus;
}