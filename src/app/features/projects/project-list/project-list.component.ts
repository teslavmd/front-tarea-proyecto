import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

// Angular Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Modelos y Servicios
import { ProjectService } from '../../../core/services/project.service';
import { ProjectResponse } from '../../../core/models/project.models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  // Inyecciones
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); // <-- La forma moderna de limpiar suscripciones
  private cdr = inject(ChangeDetectorRef); // Para forzar detección de cambios si es necesario

  // Estado del componente
  isLoading = true;
  errorMessage: string | null = null;

  // Configuración de la tabla
  displayedColumns: string[] = ['name', 'startDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<ProjectResponse>([]);

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.projectService.getAllProjects()
      .pipe(
        // takeUntilDestroyed corta la suscripción automáticamente si el componente se destruye
        takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe({
        next: (projects) => {
          this.dataSource.data = projects;
          this.isLoading = false;
          console.log(projects);
          console.log(this.dataSource.data);

          this.cdr.detectChanges();

        },
        error: (err) => {
          this.errorMessage = 'No se pudieron cargar los proyectos. Intente nuevamente.';
          this.isLoading = false;
          console.error('Error cargando proyectos:', err);
          this.cdr.detectChanges();
        
        }
      });
  }

  // Métodos de navegación y acciones
  createNewProject(): void {
    this.router.navigate(['/projects/new']);
  }

  viewDetail(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  changeStatus(projectId: number): void {
    // Aquí podrías abrir un MatDialog en el futuro. Por ahora, solo logueamos.
    console.log(`Abrir modal para cambiar estado del proyecto ${projectId}`);
  }
}