import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Dialog e Inputs
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core
import { ProjectService } from '../../../core/services/project.service';
import { ProjectStatus } from '../../../core/models/project.models';

export interface DialogData {
  projectId: number;
  currentStatus: ProjectStatus;
}

@Component({
  selector: 'app-project-status-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, 
    MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './project-status-dialog.component.html',
  styleUrls: ['./project-status-dialog.component.scss']
})
export class ProjectStatusDialogComponent {
  // Inyecciones
  dialogRef = inject(MatDialogRef<ProjectStatusDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);
  private projectService = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef); // Para la UX que aprendimos antes

  // Estados disponibles para el select
  statuses: ProjectStatus[] = ['PLANNED', 'ACTIVE', 'CLOSED'];
  
  // Estado inicial del componente
  selectedStatus: ProjectStatus = this.data.currentStatus;
  isLoading = false;
  errorMessage: string | null = null;

  onCancel(): void {
    // Cerramos devolviendo false (o null) indicando que no hubo cambios
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    // Si no cambió el estado, simplemente cerramos
    if (this.selectedStatus === this.data.currentStatus) {
      this.dialogRef.close(false);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.projectService.changeProjectStatus(this.data.projectId, { newStatus: this.selectedStatus })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Forzamos actualización visual
          // Cerramos devolviendo true para avisarle a la tabla que debe recargar
          this.dialogRef.close(true); 
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error.message || 'Error cambiando estado';
          this.cdr.detectChanges(); // Forzamos la vista del error
          console.error('Error cambiando estado:', err);
        }
      });
  }
}