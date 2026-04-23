import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = false;

  // Definimos el formulario con validaciones
  projectForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isLoading = true;
      
      // Formateamos las fechas a string YYYY-MM-DD para que Spring las entienda
      const formValue = {
        ...this.projectForm.value,
        startDate: this.formatDate(this.projectForm.value.startDate),
        endDate: this.formatDate(this.projectForm.value.endDate)
      };

      this.projectService.createProject(formValue as any).subscribe({
        next: () => {
          this.snackBar.open('Proyecto creado con éxito', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Error al crear el proyecto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}