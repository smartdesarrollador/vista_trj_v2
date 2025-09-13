import { Component, OnInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';

import { FuturisticCardComponent } from '../../components/futuristic-card/futuristic-card.component';
import { PublicDigitalCardService } from '../../services/public-digital-card.service';
import { DigitalCard } from '../../interfaces/digital-card.interface';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner.component';
import { PwaInstallComponent } from '../../components/shared/pwa-install/pwa-install.component';
import { ManifestService } from '../../services/manifest.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-futuristic-card-page',
  standalone: true,
  imports: [CommonModule, FuturisticCardComponent, LoadingSpinnerComponent, PwaInstallComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-black to-purple-900 overflow-hidden">
      <!-- Cyber Grid Background -->
      <div class="fixed inset-0 opacity-10 pointer-events-none">
        <div class="cyber-background-grid"></div>
      </div>

      <!-- Particle Field Background -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="futuristic-background-particles"></div>
      </div>

      @if (isLoading()) {
      <div class="relative z-10 flex justify-center items-center min-h-screen">
        <div class="cyber-loading-container">
          <div class="cyber-spinner"></div>
          <p class="text-cyan-400 font-mono text-lg mt-4 animate-pulse">
            Inicializando interfaz futurista...
          </p>
        </div>
      </div>
      } @else if (error()) {
      <div class="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div class="max-w-md cyber-error-container">
          <div class="cyber-error-icon mb-6"></div>
          <h1 class="text-6xl font-bold text-cyan-400 mb-4 glitch-text">404</h1>
          <h2 class="text-2xl font-semibold text-cyan-300 mb-4 font-mono">
            TARJETA.NOT_FOUND
          </h2>
          <p class="text-cyan-500 mb-8 font-mono">
            {{ error() }}
          </p>
          <button
            (click)="navigateHome()"
            class="cyber-button primary-button"
          >
            <span class="button-text">VOLVER.HOME()</span>
            <span class="button-icon">🚀</span>
          </button>
        </div>
      </div>
      } @else {
      <div class="relative z-10 flex justify-center items-center min-h-screen py-8 px-4">
        <app-futuristic-card
          [cardData]="cardData()"
          [hideShareButtons]="false"
          [shareUrl]="absoluteCardUrl()"
        />
      </div>
      }
    </div>

    <!-- PWA Install Component -->
    <app-pwa-install [userCard]="cardData()"></app-pwa-install>
  `,
  styleUrl: './futuristic-card-page.component.css'
})
export class FuturisticCardPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);
  private publicCardService = inject(PublicDigitalCardService);
  private manifestService = inject(ManifestService);
  private destroyRef = inject(DestroyRef);

  // Signals para el estado del componente
  cardData = signal<DigitalCard | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  absoluteCardUrl = signal<string>('');

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
            // URL para tarjeta futurista
            const currentUrl = `${environment.siteUrl}/futuristic/${card.slug}`;
            this.absoluteCardUrl.set(currentUrl);

            this.configureMetaTags(card);
            this.addStructuredData(card);

            // Generar manifest dinámico para tarjeta futurista
            this.manifestService.updateManifestLink(card, currentUrl);

            this.isLoading.set(false);
          } else {
            this.handleError('Esta tarjeta futurista no está disponible');
          }
        },
        error: (err) => {
          console.error('Error loading futuristic card:', err);
          this.handleError('Error al cargar la tarjeta futurista');
        },
      });
  }

  private configureMetaTags(card: DigitalCard): void {
    const name = card.personal_info?.name || 'Tarjeta Futurista';
    const title = card.personal_info?.title || '';
    const description = card.about_info?.description
      ? `Tarjeta digital futurista de ${name} - ${card.about_info.description}`
      : `Experiencia futurista de la tarjeta digital de ${name}`;
    const pageTitle = title ? `🚀 ${name} - ${title} [FUTURISTIC]` : `🚀 ${name} [FUTURISTIC]`;

    const absoluteUrl = `${environment.siteUrl}/futuristic/${card.slug}`;
    const imageUrl = this.getAbsoluteImageUrl(card.personal_info?.photo);

    // Título de la página con indicador futurista
    this.title.setTitle(pageTitle);

    // Remover meta tags existentes
    this.removeExistingMetaTags();

    // Meta tags básicos con tema futurista
    this.meta.addTag({ name: 'description', content: description });
    this.meta.addTag({ name: 'keywords', content: this.generateFuturisticKeywords(card) });
    this.meta.addTag({ name: 'author', content: name });
    this.meta.addTag({ name: 'robots', content: 'index, follow' });
    this.meta.addTag({ name: 'theme-color', content: '#00f3ff' });

    // Canonical URL
    this.meta.addTag({ rel: 'canonical', href: absoluteUrl });

    // Open Graph con tema futurista
    this.meta.addTag({ property: 'og:title', content: pageTitle });
    this.meta.addTag({ property: 'og:description', content: description });
    this.meta.addTag({ property: 'og:type', content: 'profile' });
    this.meta.addTag({ property: 'og:url', content: absoluteUrl });
    this.meta.addTag({ property: 'og:site_name', content: `${environment.siteName} [FUTURISTIC]` });
    this.meta.addTag({ property: 'og:locale', content: 'es_ES' });

    // Open Graph imágenes
    this.meta.addTag({ property: 'og:image', content: imageUrl });
    this.meta.addTag({ property: 'og:image:width', content: '1200' });
    this.meta.addTag({ property: 'og:image:height', content: '630' });
    this.meta.addTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.addTag({ property: 'og:image:alt', content: `Tarjeta futurista de ${name}` });

    // Twitter Cards
    this.meta.addTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.addTag({ name: 'twitter:title', content: pageTitle });
    this.meta.addTag({ name: 'twitter:description', content: description });
    this.meta.addTag({ name: 'twitter:image', content: imageUrl });
  }

  private generateFuturisticKeywords(card: DigitalCard): string {
    const keywords = [
      'tarjeta digital futurista',
      'perfil cyberpunk',
      'contacto holográfico',
      'interfaz futurista',
      'experiencia cyber',
      'tarjeta 3D'
    ];

    if (card.personal_info?.name) {
      keywords.push(card.personal_info.name.toLowerCase());
    }

    if (card.personal_info?.title) {
      keywords.push(card.personal_info.title.toLowerCase());
    }

    return keywords.join(', ');
  }

  private getAbsoluteImageUrl(imageUrl?: string): string {
    return `${environment.siteUrl}${environment.defaultImage}`;
  }

  private addStructuredData(card: DigitalCard): void {
    this.removeExistingStructuredData();

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": card.personal_info?.name || 'Tarjeta Futurista',
      "jobTitle": card.personal_info?.title || '',
      "description": card.about_info?.description || `Tarjeta digital futurista de ${card.personal_info?.name}`,
      "url": `${environment.siteUrl}/futuristic/${card.slug}`,
      "image": this.getAbsoluteImageUrl(card.personal_info?.photo),
      "contactPoint": {
        "@type": "ContactPoint",
        "email": card.contact_info?.email || '',
        "telephone": card.contact_info?.phone || '',
        "contactType": "personal"
      }
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    script.id = 'structured-data-futuristic';
    this.document.head.appendChild(script);
  }

  private removeExistingMetaTags(): void {
    const metaSelectors = [
      'name="description"', 'name="keywords"', 'name="author"', 'name="robots"',
      'property="og:title"', 'property="og:description"', 'property="og:url"',
      'name="twitter:title"', 'name="twitter:description"'
    ];

    metaSelectors.forEach(selector => {
      const existingTag = this.document.querySelector(`meta[${selector}]`);
      if (existingTag) existingTag.remove();
    });
  }

  private removeExistingStructuredData(): void {
    const existingScript = this.document.getElementById('structured-data-futuristic');
    if (existingScript) existingScript.remove();
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.isLoading.set(false);
    this.cardData.set(null);
    this.title.setTitle('Tarjeta Futurista no encontrada');
  }

  ngOnDestroy(): void {
    this.manifestService.removeOldManifestURL();
  }
}
