import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  showNavbar = signal(true);

  user = signal<{ name: string; email: string } | null>(null);

  ngOnInit() {
    // Al iniciar el componente, leemos el token real
    const realUser = this.authService.getDecodedUser();
    if (realUser) {
      this.user.set(realUser);
    }
  }

  constructor() {
    // Escuchamos los cambios de ruta de la app
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed() // Se desuscribe automáticamente cuando el componente muere
    ).subscribe((event: any) => {
      // Si la ruta contiene '/auth', ocultamos el navbar, sino lo mostramos
      const isAuthRoute = event.urlAfterRedirects.includes('/login') || event.urlAfterRedirects.includes('/register');
      this.showNavbar.set(!isAuthRoute);

      // Si no estamos en una ruta de autenticación, leemos el token real para mostrar el nombre del usuario en el navbar
      if (!isAuthRoute) {
        const realUser = this.authService.getDecodedUser();
        this.user.set(realUser);
      }
    });
  }

  logout() {
    this.authService.logout();
    console.log('Cerrando sesión...');
    this.user.set(null);
    this.router.navigate(['/auth/login']);
  }
}