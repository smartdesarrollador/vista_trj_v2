import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
export const routes: Routes = [
  // Ruta por defecto - Página de bienvenida
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/welcome/welcome.component').then(
        (m) => m.WelcomeComponent
      ),
    title: 'Tarjeta Digital | Perfiles Profesionales del Futuro',
  },

  // Ruta pública para tarjetas digitales (diseño clásico)
  {
    path: 'tarjeta/:slug',
    loadComponent: () =>
      import('./pages/public-card/public-card.component').then(
        (m) => m.PublicCardComponent
      ),
    title: 'Tarjeta Digital',
  },

  // Ruta pública para tarjetas futuristas
  {
    path: 'tarjeta-dos/:slug',
    loadComponent: () =>
      import(
        './pages/futuristic-card-page/futuristic-card-page.component'
      ).then((m) => m.FuturisticCardPageComponent),
    title: 'Tarjeta Futurista',
    data: { theme: 'futuristic' },
  },
  // Ruta pública para tarjetas tres
  {
    path: 'tarjeta-tres/:slug',
    loadComponent: () =>
      import('./pages/public-card-tres/public-card-tres.component').then(
        (m) => m.PublicCardTresComponent
      ),
    title: 'Tarjeta Digital',
  },

  // Rutas de autenticación
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./paginas/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Iniciar sesión',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./paginas/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Registrarse',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import(
            './paginas/auth/forgot-password/forgot-password.component'
          ).then((m) => m.ForgotPasswordComponent),
        title: 'Recuperar contraseña',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./paginas/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
        title: 'Restablecer contraseña',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Vista principal (requiere autenticación)
  {
    path: '',
    loadComponent: () =>
      import('./paginas/vista/vista.component').then((m) => m.VistaComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./paginas/vista/inicio/inicio.component').then(
            (m) => m.InicioComponent
          ),
        title: 'Tarjeta Digital - Inicio',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./paginas/vista/about/about.component').then(
            (m) => m.AboutComponent
          ),
        title: 'Acerca de - Tarjeta Digital',
      },
      {
        path: 'cuenta',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/vista/cuenta/cuenta.component').then(
            (m) => m.CuentaComponent
          ),
        title: 'Mi Cuenta - Tarjeta Digital',
      },
    ],
  },

  // Ruta 404 - debe ser la última
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Página no encontrada',
  },
];
