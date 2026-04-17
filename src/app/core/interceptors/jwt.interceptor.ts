import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inyectamos las dependencias necesarias
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 2. Obtenemos el token actual
  const token = authService.getToken();

  // 3. Clonamos la petición original
  let authReq = req;
  
  // Si tenemos un token, le agregamos el Header de Autorización
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 4. Enviamos la petición clonada (con o sin token) al siguiente eslabón
  return next(authReq).pipe(
    // 5. Interceptamos las respuestas de error del backend
    catchError((error: HttpErrorResponse) => {
      // Si el backend nos dice que no estamos autorizados (401) o prohibidos (403)
      if (error.status === 401 || error.status === 403 && !req.url.includes('/auth/')) {
        console.warn('Token expirado o inválido. Cerrando sesión...');
        authService.logout(); // Limpiamos el localStorage y el estado
        router.navigate(['/login']); // Lo mandamos a loguearse de nuevo
      }
      
      // Dejamos que el error siga su curso por si el componente quiere hacer algo más
      return throwError(() => error);
    })
  );
};