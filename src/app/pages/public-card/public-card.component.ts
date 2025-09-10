import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';

import { DigitalCardComponent } from '../../components/digital-card/digital-card.component';
import { PublicDigitalCardService } from '../../services/public-digital-card.service';
import { DigitalCard } from '../../interfaces/digital-card.interface';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-public-card',
  standalone: true,
  imports: [CommonModule, DigitalCardComponent, LoadingSpinnerComponent],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      @if (isLoading()) {
      <div class="flex justify-center items-center min-h-screen">
        <app-loading-spinner message="Cargando tarjeta digital..." />
      </div>
      } @else if (error()) {
      <div
        class="flex flex-col items-center justify-center min-h-screen text-center px-4"
      >
        <div class="max-w-md">
          <h1 class="text-6xl font-bold text-white mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-300 mb-4">
            Tarjeta no encontrada
          </h2>
          <p class="text-gray-400 mb-8">
            {{ error() }}
          </p>
          <a
            routerLink="/"
            class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Volver al inicio
          </a>
        </div>
      </div>
      } @else {
      <div
        class="relative z-10 flex justify-center items-center min-h-screen py-8 px-4"
      >
        <app-digital-card [cardData]="cardData()" [hideShareButtons]="false" />
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
})
export class PublicCardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private publicCardService = inject(PublicDigitalCardService);
  private destroyRef = inject(DestroyRef);

  // Signals para el estado del componente
  cardData = signal<DigitalCard | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const slug = params['slug'];
        if (slug) {
          this.loadCard(slug);
        } else {
          this.handleError('URL no válida');
        }
      });
  }

  private loadCard(slug: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.publicCardService
      .getDigitalCardBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (card) => {
          if (card && this.publicCardService.validateDigitalCard(card)) {
            this.cardData.set(card);
            this.configureMetaTags(card);
            this.isLoading.set(false);
          } else {
            this.handleError('Esta tarjeta no está disponible públicamente');
          }
        },
        error: (err) => {
          console.error('Error loading digital card:', err);
          this.handleError('Error al cargar la tarjeta digital');
        },
      });
  }

  private configureMetaTags(card: DigitalCard): void {
    const name = card.personal_info?.name || 'Tarjeta Digital';
    const title = card.personal_info?.title || '';
    const description =
      card.about_info?.description || `Tarjeta digital de ${name}`;
    const pageTitle = title ? `${name} - ${title}` : name;

    // Usar una URL relativa para evitar problemas con SSR
    const url = `/tarjeta/${card.slug}`;

    // Título de la página
    this.title.setTitle(pageTitle);

    // Meta tags básicos
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'profile' });
    this.meta.updateTag({ property: 'og:url', content: url });

    if (card.personal_info?.photo) {
      this.meta.updateTag({
        property: 'og:image',
        content: card.personal_info.photo,
      });
    }

    // Twitter Cards
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    if (card.personal_info?.photo) {
      this.meta.updateTag({
        name: 'twitter:image',
        content: card.personal_info.photo,
      });
    }
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.isLoading.set(false);
    this.cardData.set(null);
    this.title.setTitle('Tarjeta no encontrada');
    this.meta.updateTag({
      name: 'description',
      content: 'La tarjeta digital solicitada no está disponible.',
    });
  }
}
