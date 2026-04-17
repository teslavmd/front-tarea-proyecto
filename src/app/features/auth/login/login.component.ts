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
  selector: 'app-login',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // 1. Inyección de dependencias (Estilo moderno Angular)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // 2. Definición del estado del componente
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor() {
    // 3. Inicialización del formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // 4. Lógica de envío
  onSubmit(): void {
    // Seguridad adicional: si alguien habilita el botón por consola, frenamos la ejecución
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Muestra los errores visualmente
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // 5. Suscripción al servicio
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Si sale bien, el servicio ya guardó el token. Solo nos queda redirigir.
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        
        // 1. Si el backend manda un JSON con un campo "message" (Ej: {"message": "El usuario ya existe"})
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } 
        // 2. Si el backend manda un texto plano en el body
        else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } 
        // 3. Si no hay body, nos guiamos por el código de estado HTTP
        else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Credenciales incorrectas o usuario inexistente.';
        } 
        else if (err.status === 409) { // 409 Conflict suele usarse para "Email ya registrado"
          this.errorMessage = 'El correo ya se encuentra registrado.';
        }
        // 4. Error genérico de caída de servidor
        else {
          this.errorMessage = 'Error de conexión con el servidor. Intenta más tarde.';
        }
        
        console.error('Detalle del error:', err);

        // Actualizamos la vista para mostrar el mensaje de error
        this.cdr.detectChanges(); 
      },
      complete: () => {
        // Se ejecuta siempre al terminar con éxito (no si hay error)
        this.isLoading = false; 
      }
    });
  }
}