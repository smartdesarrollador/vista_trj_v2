import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit {
  private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit(): void {
    this.configureMetaTags();
  }

  private configureMetaTags(): void {
    // Configurar título de la página
    this.title.setTitle('Tarjeta Digital | Perfiles Profesionales del Futuro');

    // Meta tags básicos
    this.meta.updateTag({ 
      name: 'description', 
      content: 'Crea tu tarjeta digital profesional con efectos holográficos únicos. Destaca tu perfil y conecta con el mundo de manera innovadora.' 
    });
    
    this.meta.updateTag({ 
      name: 'keywords', 
      content: 'tarjeta digital, perfil profesional, holográfico, tarjeta de presentación, networking, contacto digital' 
    });

    // Open Graph
    this.meta.updateTag({ 
      property: 'og:title', 
      content: 'Tarjeta Digital | Perfiles Profesionales del Futuro' 
    });
    
    this.meta.updateTag({ 
      property: 'og:description', 
      content: 'Crea tu tarjeta digital profesional con efectos holográficos únicos. Destaca tu perfil y conecta con el mundo de manera innovadora.' 
    });
    
    this.meta.updateTag({ 
      property: 'og:type', 
      content: 'website' 
    });
    
    this.meta.updateTag({ 
      property: 'og:url', 
      content: environment.siteUrl 
    });
    
    this.meta.updateTag({ 
      property: 'og:image', 
      content: `${environment.siteUrl}/assets/images/default-og-image.svg` 
    });

    // Twitter Cards
    this.meta.updateTag({ 
      name: 'twitter:card', 
      content: 'summary_large_image' 
    });
    
    this.meta.updateTag({ 
      name: 'twitter:title', 
      content: 'Tarjeta Digital | Perfiles Profesionales del Futuro' 
    });
    
    this.meta.updateTag({ 
      name: 'twitter:description', 
      content: 'Crea tu tarjeta digital profesional con efectos holográficos únicos.' 
    });
    
    this.meta.updateTag({ 
      name: 'twitter:image', 
      content: `${environment.siteUrl}/assets/images/default-og-image.svg` 
    });
  }
}
