import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center space-y-4">
      <div class="relative">
        <!-- Spinner principal -->
        <div
          class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
        ></div>
        <!-- Spinner secundario con animación inversa -->
        <div
          class="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-400 rounded-full animate-spin-reverse"
        ></div>
      </div>
      <div class="text-center">
        <p class="text-white text-lg font-medium">{{ message }}</p>
        <!-- Puntos animados -->
        <div class="mt-2 flex justify-center space-x-1">
          <div
            class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          ></div>
          <div
            class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          ></div>
          <div
            class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes spin-reverse {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }
      .animate-spin-reverse {
        animation: spin-reverse 1s linear infinite;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() message = 'Cargando...';
}
