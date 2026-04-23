/**
 * Enum para los estados del proyecto.
 * NOTA: Asegúrate de que estos valores coincidan EXACTAMENTE con 
 * los valores de tu enum ProjectStatus en Java.
 */
export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; 

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