import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambiar-tarjeta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cambiar-tarjeta.component.html',
  styleUrl: './cambiar-tarjeta.component.css'
})
export class CambiarTarjetaComponent {
  @Input() currentSlug: string = '';

  private router = inject(Router);

  private cardRoutes = [
    'tarjeta',
    'tarjeta-dos',
    'tarjeta-tres'
  ];

  cambiarTarjeta(): void {
    if (!this.currentSlug) return;

    const currentRoute = this.getCurrentRoute();
    const currentIndex = this.cardRoutes.indexOf(currentRoute);

    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % this.cardRoutes.length;
    const nextRoute = this.cardRoutes[nextIndex];

    this.router.navigate([`/${nextRoute}`, this.currentSlug]);
  }

  private getCurrentRoute(): string {
    const currentUrl = this.router.url;

    for (const route of this.cardRoutes) {
      if (currentUrl.includes(`/${route}/`)) {
        return route;
      }
    }

    return '';
  }
}
