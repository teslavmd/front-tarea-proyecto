import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';
import { TaskResponseDTO } from '../../../core/models/task.models';
import { TaskChangeStatusDialogComponent } from '../task-change-status-dialog/task-change-status-dialog.component';

import { MatDialog } from '@angular/material/dialog';
import { TaskCreateDialogComponent } from '../task-create-dialog/task-create-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  // Recibimos el ID del proyecto desde el HTML padre (ProjectDetail)
  @Input({ required: true }) projectId!: number;
  @Input({ required: true }) projectStatus!: string;

  tasks: TaskResponseDTO[] = [];
  displayedColumns: string[] = ['title', 'assignee', 'estimateHours', 'status', 'actions'];
  isLoading = true;

  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.loadTasks();
  }


  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasksByProjectId(this.projectId).subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las tareas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(TaskCreateDialogComponent, {
      width: '500px',
      // Le pasamos el projectId actual al modal
      data: { projectId: this.projectId } 
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si el modal devuelve 'true', significa que se guardó en la BD.
      // Recargamos la lista automáticamente usando setTimeout para evitar NG0100.
      if (result) {
        setTimeout(() => this.loadTasks());
      }
    });
  }

  openChangeStatusDialog(task: TaskResponseDTO) {
    const dialogRef = this.dialog.open(TaskChangeStatusDialogComponent, {
      width: '400px',
      data: { 
        projectId: this.projectId,
        task: task 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si el modal devolvió true, fue un éxito y recargamos la lista
      if (result) {
        setTimeout(() => this.loadTasks());
      }
    });
  }
}