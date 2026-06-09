import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../app/env/environment';
import { 
  TaskResponseDTO, 
  CreateTaskRequestDTO, 
  ChangeTaskStatusRequestDTO 
} from '../models/task.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  
  // Usamos la URL base general, ya que las rutas de tareas dependen del projectId
  private readonly API_URL = environment.apiUrl;

  createTask(projectId: number, request: CreateTaskRequestDTO): Observable<TaskResponseDTO> {
    return this.http.post<TaskResponseDTO>(
      `${this.API_URL}/projects/${projectId}/tasks`, 
      request
    );
  }

  getTaskById(projectId: number, taskId: number): Observable<TaskResponseDTO> {
    return this.http.get<TaskResponseDTO>(
      `${this.API_URL}/projects/${projectId}/tasks/${taskId}`
    );
  }

  changeTaskStatus(projectId: number, taskId: number, request: ChangeTaskStatusRequestDTO): Observable<TaskResponseDTO> {
    return this.http.post<TaskResponseDTO>(
      `${this.API_URL}/projects/${projectId}/tasks/${taskId}/status`, 
      request
    );
  }

  getTasksByProjectId(projectId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.API_URL}/projects/${projectId}/tasks`);
  }


}