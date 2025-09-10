import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4"
    >
      <div class="max-w-md w-full text-center">
        <h1 class="text-8xl font-bold text-white mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-300 mb-4">
          Página no encontrada
        </h2>
        <p class="text-gray-400 mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <a
          routerLink="/"
          class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
