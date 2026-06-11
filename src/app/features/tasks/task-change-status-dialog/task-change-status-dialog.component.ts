import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../../app/core/services/task.service';
import { TaskResponseDTO, TaskStatus } from '../../../../app/core/models/task.models';

export interface ChangeStatusDialogData {
  projectId: number;
  task: TaskResponseDTO;
}

@Component({
  selector: 'app-task-change-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-change-status-dialog.component.html',
  styleUrls: ['./task-change-status-dialog.component.scss']
})
export class TaskChangeStatusDialogComponent {
  selectedStatus: TaskStatus;
  isLoading = false;
  errorMessage: string | null = null;
  
  private taskService = inject(TaskService);

  constructor(
    public dialogRef: MatDialogRef<TaskChangeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusDialogData
  ) {
    // Inicializamos el select con el estado actual de la tarea
    this.selectedStatus = this.data.task.status;
  }

  onSave() {
    // Si no cambió el estado, no hacemos la petición HTTP
    if (this.selectedStatus === this.data.task.status) {
      this.dialogRef.close();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Acordate de que tu backend espera el campo "newStatus" en el DTO
    this.taskService.changeTaskStatus(this.data.projectId, this.data.task.id, { newStatus: this.selectedStatus })
      .subscribe({
        next: () => {
          this.dialogRef.close(true); // Devolvemos true para que la grilla se recargue
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409 || err.status === 400) {
            this.errorMessage = err.error.message || 'Error de validación';
          } else {
            this.errorMessage = 'Ocurrió un error al cambiar el estado.';
          }
        }
      });
  }
}