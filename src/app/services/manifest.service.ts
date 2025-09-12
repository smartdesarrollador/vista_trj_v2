import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManifestService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  generateDynamicManifest(userCard: any, currentUrl: string): any {
    if (!userCard) return null;

    const userName = userCard.name || userCard.nombre || 'Usuario';
    const userTitle = userCard.title || userCard.cargo || 'Profesional';
    const userLocation = userCard.location || userCard.ubicacion || '';

    return {
      "name": `${userName} - Tarjeta Digital`,
      "short_name": userName,
      "description": `Tarjeta digital profesional de ${userName}, ${userTitle}${userLocation ? ' en ' + userLocation : ''}. Acceso directo a toda su información de contacto.`,
      "start_url": currentUrl,
      "display": "standalone",
      "orientation": "portrait-primary",
      "theme_color": "#00ffff",
      "background_color": "#000000",
      "scope": "/",
      "lang": "es-ES",
      "dir": "ltr",
      "categories": ["business", "productivity", "social"],
      "prefer_related_applications": false,
      "icons": [
        {
          "src": "assets/pwa/apple-touch-icon-180x180.png",
          "sizes": "180x180",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "assets/pwa/icon_JE_192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "assets/pwa/icon_JE_512_maskable.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "assets/pwa/icon_JE_512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "assets/pwa/logo_JE_1024.png",
          "sizes": "1024x1024",
          "type": "image/png",
          "purpose": "any"
        }
      ],
      "shortcuts": [
        {
          "name": `Ver Tarjeta de ${userName}`,
          "short_name": "Tarjeta",
          "description": `Acceso directo a la tarjeta digital de ${userName}`,
          "url": currentUrl,
          "icons": [
            {
              "src": "assets/pwa/icon_JE_192.png",
              "sizes": "192x192",
              "type": "image/png"
            }
          ]
        }
      ],
      "share_target": {
        "action": currentUrl,
        "method": "GET",
        "params": {
          "title": "title",
          "text": "text",
          "url": "url"
        }
      },
      "screenshots": [
        {
          "src": "assets/pwa/screenshot-wide.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": `Vista desktop de la tarjeta digital de ${userName}`
        },
        {
          "src": "assets/pwa/screenshot-narrow.png",
          "sizes": "360x640",
          "type": "image/png",
          "form_factor": "narrow",
          "label": `Vista móvil de la tarjeta digital de ${userName}`
        }
      ],
      "protocol_handlers": [
        {
          "protocol": "mailto",
          "url": `${currentUrl}?email=%s`
        }
      ]
    };
  }

  updateManifestLink(userCard: any, currentUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const manifest = this.generateDynamicManifest(userCard, currentUrl);
    if (!manifest) return;

    // Remover manifest anterior si existe
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    // Crear nuevo manifest como blob URL
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json'
    });
    const manifestURL = URL.createObjectURL(manifestBlob);

    // Crear nuevo link tag para manifest
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestURL;
    document.head.appendChild(manifestLink);

    console.log('[Manifest] Updated dynamic manifest for user:', userCard.name || userCard.nombre);
    console.log('[Manifest] Start URL:', currentUrl);
  }

  removeOldManifestURL(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink && manifestLink.href.startsWith('blob:')) {
      URL.revokeObjectURL(manifestLink.href);
    }
  }
}