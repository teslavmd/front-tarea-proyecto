/**
 * Enum para los estados del proyecto.
 */
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED'; 

export interface ProjectResponse {
  id: number;
  name: string;
  startDate: string; 
  endDate: string;
  status: ProjectStatus;
}

export interface CreateProjectRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface ChangeProjectStatusRequest {
  newStatus: ProjectStatus;
}