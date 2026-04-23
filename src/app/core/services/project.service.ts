import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ProjectResponse, 
  CreateProjectRequest, 
  ChangeProjectStatusRequest 
} from '../models/project.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Ajustá el puerto y prefijo según la configuración de tu Docker/Spring
  private readonly API_URL = 'http://localhost:8080/projects'; 
  
  private http = inject(HttpClient);

  /**
   * Crea un nuevo proyecto
   * POST /projects
   */
  createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.API_URL, request);
  }

  /**
   * Obtiene un proyecto por su ID
   * GET /projects/{projectId}
   */
  getProjectById(projectId: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.API_URL}/${projectId}`);
  }

  /**
   * Cambia el estado de un proyecto
   * POST /projects/{projectId}/status
   */
  changeProjectStatus(projectId: number, request: ChangeProjectStatusRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${projectId}/status`, request);
  }
  /**
   * Obtiene todos los proyectos
   * GET /projects
   */
  getAllProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.API_URL);
  }
}