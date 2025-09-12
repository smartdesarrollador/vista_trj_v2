import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';

import { DigitalCardComponent } from '../../components/digital-card/digital-card.component';
import { PublicDigitalCardService } from '../../services/public-digital-card.service';
import { DigitalCard } from '../../interfaces/digital-card.interface';
import { LoadingSpinnerComponent } from '../../components/shared/loading-spinner/loading-spinner.component';
import { environment } from '../../../environments/environment';

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
  private document = inject(DOCUMENT);
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
            this.addStructuredData(card);
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

    // Construir URL absoluta basada en el environment
    const absoluteUrl = `${environment.siteUrl}/tarjeta/${card.slug}`;
    
    // Obtener imagen optimizada para Open Graph
    const imageUrl = this.getAbsoluteImageUrl(card.personal_info?.photo);

    // Título de la página
    this.title.setTitle(pageTitle);

    // Meta tags básicos
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: this.generateKeywords(card) });
    this.meta.updateTag({ name: 'author', content: name });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    // Canonical URL
    this.meta.updateTag({ name: 'canonical', content: absoluteUrl });

    // Open Graph básico
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'profile' });
    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ property: 'og:site_name', content: environment.siteName });
    this.meta.updateTag({ property: 'og:locale', content: 'es_ES' });
    this.meta.updateTag({ property: 'og:updated_time', content: new Date().toISOString() });

    // Open Graph imágenes
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.updateTag({ property: 'og:image:alt', content: `Foto de perfil de ${name}` });

    // Open Graph Profile (para perfiles profesionales)
    if (card.personal_info?.name) {
      this.meta.updateTag({ property: 'profile:first_name', content: card.personal_info.name.split(' ')[0] });
      this.meta.updateTag({ property: 'profile:last_name', content: card.personal_info.name.split(' ').slice(1).join(' ') });
      this.meta.updateTag({ property: 'profile:username', content: card.slug });
    }

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: `Foto de perfil de ${name}` });
    
    // Twitter adicional
    if (card.contact_info?.twitter) {
      this.meta.updateTag({ name: 'twitter:creator', content: `@${card.contact_info.twitter}` });
    }

    // Información profesional adicional
    if (card.personal_info?.title) {
      this.meta.updateTag({ name: 'profile:job_title', content: card.personal_info.title });
    }

    // Información de contacto estructurada
    if (card.contact_info?.email) {
      this.meta.updateTag({ name: 'contact:email', content: card.contact_info.email });
    }
    if (card.contact_info?.phone) {
      this.meta.updateTag({ name: 'contact:phone_number', content: card.contact_info.phone });
    }
  }

  /**
   * Obtener URL absoluta para imagen de Open Graph
   * Optimizada para redes sociales (1200x630 recomendado)
   */
  private getAbsoluteImageUrl(imageUrl?: string): string {
    if (!imageUrl) {
      // Usar imagen por defecto
      return `${environment.siteUrl}${environment.defaultImage}`;
    }

    // Si ya es una URL absoluta, devolverla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Para URLs externas, verificar si necesitan parámetros de optimización
      return this.addImageOptimizationParams(imageUrl);
    }

    // Construir URL absoluta para imágenes del servidor
    const fullImageUrl = `${environment.urlDominioApi}/${imageUrl}`;
    return this.addImageOptimizationParams(fullImageUrl);
  }

  /**
   * Agregar parámetros de optimización para imágenes
   * Algunos servicios permiten redimensionar automáticamente
   */
  private addImageOptimizationParams(imageUrl: string): string {
    // Si la imagen ya tiene parámetros, no agregar más
    if (imageUrl.includes('?')) {
      return imageUrl;
    }

    // Para imágenes locales del proyecto, no agregar parámetros
    if (imageUrl.includes(environment.siteUrl)) {
      return imageUrl;
    }

    // Para servicios de imágenes conocidos, se pueden agregar parámetros de optimización
    // Por ahora devolvemos la URL sin modificar para evitar romper imágenes existentes
    return imageUrl;
  }

  /**
   * Generar keywords dinámicas basadas en la información de la tarjeta
   */
  private generateKeywords(card: DigitalCard): string {
    const keywords = ['tarjeta digital', 'perfil profesional', 'contacto'];
    
    if (card.personal_info?.name) {
      keywords.push(card.personal_info.name.toLowerCase());
    }
    
    if (card.personal_info?.title) {
      keywords.push(card.personal_info.title.toLowerCase());
    }
    
    if (card.about_info?.description) {
      // Extraer palabras clave de la descripción
      const words = card.about_info.description
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 4 && !['este', 'esta', 'para', 'como', 'desde', 'donde', 'cuando'].includes(word))
        .slice(0, 3);
      keywords.push(...words);
    }

    return keywords.join(', ');
  }

  /**
   * Agregar datos estructurados Schema.org para SEO avanzado
   * Mejora la indexación en buscadores y habilita rich snippets
   */
  private addStructuredData(card: DigitalCard): void {
    // Remover datos estructurados existentes si los hay
    this.removeExistingStructuredData();

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": card.personal_info?.name || 'Tarjeta Digital',
      "jobTitle": card.personal_info?.title || '',
      "description": card.about_info?.description || `Tarjeta digital de ${card.personal_info?.name}`,
      "url": `${environment.siteUrl}/tarjeta/${card.slug}`,
      "image": this.getAbsoluteImageUrl(card.personal_info?.photo),
      "sameAs": this.getSocialMediaUrls(card),
      "contactPoint": {
        "@type": "ContactPoint",
        "email": card.contact_info?.email || '',
        "telephone": card.contact_info?.phone || '',
        "contactType": "personal"
      },
      "address": card.personal_info?.location ? {
        "@type": "Place",
        "name": card.personal_info.location
      } : undefined,
      "knowsAbout": this.extractSkillsFromCard(card),
      "hasOccupation": card.personal_info?.title ? {
        "@type": "Occupation",
        "name": card.personal_info.title
      } : undefined
    };

    // Limpiar propiedades undefined
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key as keyof typeof structuredData] === undefined || 
          structuredData[key as keyof typeof structuredData] === '' ||
          (Array.isArray(structuredData[key as keyof typeof structuredData]) && 
           (structuredData[key as keyof typeof structuredData] as any[]).length === 0)) {
        delete structuredData[key as keyof typeof structuredData];
      }
    });

    // Crear y agregar el script JSON-LD
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    script.id = 'structured-data-person';
    this.document.head.appendChild(script);
  }

  /**
   * Remover datos estructurados existentes para evitar duplicados
   */
  private removeExistingStructuredData(): void {
    const existingScript = this.document.getElementById('structured-data-person');
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Extraer URLs de redes sociales de la información de contacto
   */
  private getSocialMediaUrls(card: DigitalCard): string[] {
    const urls: string[] = [];
    
    if (card.contact_info?.website) {
      urls.push(card.contact_info.website);
    }
    
    if (card.contact_info?.linkedin) {
      const linkedinUrl = card.contact_info.linkedin.startsWith('http') 
        ? card.contact_info.linkedin 
        : `https://linkedin.com/in/${card.contact_info.linkedin}`;
      urls.push(linkedinUrl);
    }
    
    if (card.contact_info?.twitter) {
      const twitterUrl = card.contact_info.twitter.startsWith('http') 
        ? card.contact_info.twitter 
        : `https://twitter.com/${card.contact_info.twitter}`;
      urls.push(twitterUrl);
    }
    
    if (card.contact_info?.instagram) {
      const instagramUrl = card.contact_info.instagram.startsWith('http') 
        ? card.contact_info.instagram 
        : `https://instagram.com/${card.contact_info.instagram}`;
      urls.push(instagramUrl);
    }

    return urls;
  }

  /**
   * Extraer habilidades de la tarjeta para Schema.org
   */
  private extractSkillsFromCard(card: DigitalCard): string[] {
    const allSkills: string[] = [];

    // Agregar habilidades del array skills si existe
    if (card.about_info?.skills && Array.isArray(card.about_info.skills)) {
      allSkills.push(...card.about_info.skills);
    }

    // Extraer habilidades adicionales de la descripción
    if (card.about_info?.description) {
      const descriptionSkills = this.extractSkillsFromDescription(card.about_info.description);
      allSkills.push(...descriptionSkills);
    }

    // Remover duplicados y limitar
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills.slice(0, 8); // Limitar a 8 habilidades principales
  }

  /**
   * Extraer habilidades de la descripción para Schema.org
   */
  private extractSkillsFromDescription(description?: string): string[] {
    if (!description) return [];

    // Palabras clave técnicas comunes para identificar habilidades
    const skillKeywords = [
      'javascript', 'typescript', 'angular', 'react', 'vue', 'node', 'python', 
      'php', 'java', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'desarrollo', 'programación', 'diseño', 'marketing', 'seo', 'ux', 'ui',
      'gestión', 'liderazgo', 'análisis', 'consultoría', 'estrategia'
    ];

    const foundSkills: string[] = [];
    const lowerDescription = description.toLowerCase();

    skillKeywords.forEach(skill => {
      if (lowerDescription.includes(skill)) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    return foundSkills.slice(0, 5); // Limitar a 5 habilidades principales
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
