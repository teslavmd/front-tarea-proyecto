import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos las dependencias usando la función inject()
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si existe un token en el servicio
  const token = authService.getToken();

  if (token) {
    // Si hay token, levantamos la barrera y lo dejamos pasar
    return true;
  }

  // Si no hay token, lo redirigimos al login.
  // Retornar un UrlTree es la forma más limpia y recomendada de redirigir en Guards funcionales.
  return router.createUrlTree(['/login']);
};