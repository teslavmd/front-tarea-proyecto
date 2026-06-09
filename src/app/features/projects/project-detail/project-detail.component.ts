import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core
import { ProjectService } from '../../../core/services/project.service';
import { ProjectResponse } from '../../../core/models/project.models';
import { TaskListComponent } from '../../tasks/task-list/task-list.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    MatCardModule, MatListModule, MatDividerModule,
    MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule,
    TaskListComponent
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute); // <-- Inyectamos la ruta activa
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  project: ProjectResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    // Leemos el parámetro 'id' de la URL (ej: /projects/5 -> id = '5')
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.loadProjectDetail(Number(idParam));
    } else {
      this.errorMessage = 'ID de proyecto no válido.';
      this.isLoading = false;
    }
  }

  private loadProjectDetail(id: number): void {
    this.isLoading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log(this.project.status);
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el proyecto. Es posible que no exista.';
        this.isLoading = false;
        console.error('Error al cargar detalle:', err);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}