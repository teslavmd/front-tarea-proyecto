import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../../app/core/services/task.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatProgressSpinnerModule,
    MatIcon
  ],
  templateUrl: './task-create-dialog.component.html',
  styleUrls: ['./task-create-dialog.component.scss']
})
export class TaskCreateDialogComponent {
  taskForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  private taskService = inject(TaskService);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    // Inicializamos el formulario con las reglas de tu backend
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      estimateHours: [1, [Validators.required, Validators.min(1)]],
      assignee: [''],
      status: ['TODO', Validators.required]
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      this.taskService.createTask(this.data.projectId, this.taskForm.value).subscribe({
        next: () => {
       
          // Devolvemos true para avisarle a la tabla que tiene que recargarse
          this.dialogRef.close(true); 
        },
        error: (err) => {
          this.isLoading = false;
          // Capturamos el 409 Conflict y mostramos el mensaje exacto de tu backend
          if (err.status === 409 || err.status === 400) {
            this.errorMessage = err.error.message; 
          } else {
            this.errorMessage = 'Ocurrió un error inesperado. Intente nuevamente.';
          }
        }
      });
    }
  }
}