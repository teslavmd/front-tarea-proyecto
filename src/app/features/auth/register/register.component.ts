import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({  
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Lo importamos para poder poner un link de "Volver al login"
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor() {
    // 1. Aquí agregamos el campo 'nombre' que nos pide el backend
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // 2. Llamamos al método register del servicio
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // Al igual que en el login, si el registro es exitoso y devuelve token, entramos directo
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        // Tratamos de mostrar un mensaje útil. Si el backend manda un mensaje (ej. "Email en uso"), lo mostramos.
        this.errorMessage = err.error?.message || 'Error al registrar el usuario. Es posible que el email ya esté en uso.';
        console.error('Error en registro:', err);

        //Actulaizamos la vista para mostrar el mensaje de error
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}