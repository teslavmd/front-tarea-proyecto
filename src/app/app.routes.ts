import { Routes } from '@angular/router';

export const routes: Routes = [
    //rutas de autenticación (publicas)
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    
    
    //rutas protegidas (aún sin crear)
    // { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)    , canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)] },
    { path: 'projects', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)    , canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)] },
    { path: 'projects/new', loadComponent: () => import('./features/projects/project-form/project-form.component').then(m => m.ProjectFormComponent)    , canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)] },
    { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)    , canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)] },
    // { path: 'tasks', loadComponent: () => import('./features/tasks/tasks.component').then(m => m.TasksComponent)    , canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)] },
    


    //rutas por defecto
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path : '**', redirectTo: 'login', pathMatch: 'full' },
];
