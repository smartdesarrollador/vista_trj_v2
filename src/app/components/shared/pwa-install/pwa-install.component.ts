import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PwaService } from '../../../services/pwa.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install.component.html',
  styleUrl: './pwa-install.component.css'
})
export class PwaInstallComponent implements OnInit, OnDestroy {
  @Input() userCard: any = null; // Recibir datos del usuario específico
  
  showInstallBanner = false;
  showManualInstructions = false;
  isInstalled = false;
  installInstructions = '';
  pwaStatus: any = {};
  currentCardUrl = '';
  showDirectShortcut = false;

  private subscriptions = new Subscription();

  constructor(
    private pwaService: PwaService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Obtener la URL actual de la tarjeta
    this.currentCardUrl = this.getCurrentCardUrl();
    
    // Subscribirse a cambios de instalabilidad
    this.subscriptions.add(
      this.pwaService.isInstallable$.subscribe(isInstallable => {
        // Solo mostrar si es instalable y estamos en una tarjeta específica
        this.showInstallBanner = isInstallable && !this.isInstalled && this.userCard && this.shouldShowBanner();
      })
    );

    // Subscribirse a cambios de instalación
    this.subscriptions.add(
      this.pwaService.isInstalled$.subscribe(isInstalled => {
        this.isInstalled = isInstalled;
        if (isInstalled) {
          this.showInstallBanner = false;
          this.showDirectShortcut = false;
        }
      })
    );

    // Obtener estado PWA
    this.pwaStatus = this.pwaService.getPwaStatus();
    
    // SIEMPRE mostrar el botón si estamos en una tarjeta específica y no está instalado
    if (this.userCard && !this.pwaStatus.isInstalled && this.pwaStatus.isSupported) {
      // Mostrar el botón independientemente de si canPrompt es true o false
      this.showDirectShortcut = true;
      console.log('[PWA] Showing install button for user card:', this.userCard);
    }
    
    // Debug logging
    console.log('[PWA] PWA Status:', this.pwaStatus);
    console.log('[PWA] UserCard:', this.userCard);
    console.log('[PWA] ShowDirectShortcut:', this.showDirectShortcut);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async installApp(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('[PWA] Install button clicked');

    // Primero intentar el prompt automático
    const installed = await this.pwaService.promptInstall();
    if (installed) {
      this.showInstallBanner = false;
      this.showDirectShortcut = false;
      return;
    }

    // Detectar si es escritorio o móvil
    const userAgent = navigator.userAgent.toLowerCase();
    const isDesktop = !/iphone|ipad|ipod|android/.test(userAgent);
    const userName = this.userCard?.name || this.userCard?.nombre || 'esta tarjeta';

    if (isDesktop) {
      // Para escritorio: intentar instalación automática sin mostrar alert
      console.log('[PWA] Desktop detected - attempting direct installation');

      // Verificar si hay un prompt event disponible
      if (this.pwaService.canInstall()) {
        // Ya se intentó arriba, si llegamos aquí es porque falló
        console.log('[PWA] Prompt failed, trying alternative methods');
      }

      // Intentar trigger del evento de instalación del navegador
      this.triggerBrowserInstallPrompt();
      return;
    }

    // Para móvil: mostrar instrucciones como antes
    let mensaje = '';

    if (/iphone|ipad|ipod/.test(userAgent)) {
      // iOS Safari
      mensaje = `Para instalar la tarjeta de ${userName}:\n\n` +
                `1. Toca el botón Compartir (📤) en la parte inferior\n` +
                `2. Desplázate hacia abajo y selecciona "Añadir a pantalla de inicio"\n` +
                `3. Toca "Añadir" para confirmar\n\n` +
                `¡La tarjeta aparecerá como una app en tu pantalla de inicio!`;
    } else if (/android/.test(userAgent)) {
      // Android Chrome/Firefox
      if (/chrome/.test(userAgent)) {
        mensaje = `Para instalar la tarjeta de ${userName}:\n\n` +
                  `1. Toca el menú (⋮) en la esquina superior derecha\n` +
                  `2. Selecciona "Instalar app" o "Añadir a pantalla de inicio"\n` +
                  `3. Toca "Instalar" para confirmar\n\n` +
                  `¡La tarjeta se instalará como una app!`;
      } else {
        mensaje = `Para instalar la tarjeta de ${userName}:\n\n` +
                  `1. Toca el menú del navegador\n` +
                  `2. Busca "Añadir a pantalla de inicio" o "Instalar"\n` +
                  `3. Confirma la instalación\n\n` +
                  `¡La tarjeta aparecerá como una app!`;
      }
    }

    if (mensaje) {
      alert(mensaje);
    }
  }

  dismissBanner(): void {
    this.showInstallBanner = false;
    
    // No mostrar de nuevo por un tiempo (usando localStorage)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  }

  dismissManualInstructions(): void {
    this.showManualInstructions = false;
  }

  private shouldShowBanner(): boolean {
    if (typeof localStorage === 'undefined') return true;
    
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return true;
    
    // Mostrar de nuevo después de 7 días
    const dismissedTime = parseInt(dismissed);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    return dismissedTime < sevenDaysAgo;
  }

  private getCurrentCardUrl(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return window.location.href;
  }

  private getCustomInstallInstructions(): string {
    if (!isPlatformBrowser(this.platformId)) return 'Instrucciones disponibles en el navegador';
    
    if (this.userCard) {
      const userName = this.userCard.name || this.userCard.nombre || 'esta tarjeta';
      return `Añade la tarjeta de ${userName} a tu pantalla de inicio para acceso rápido`;
    }
    
    return this.pwaService.getPlatformInstallInstructions();
  }

  createDirectShortcut(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Intentar instalación directa primero
    this.installApp();
  }

  dismissDirectShortcut(): void {
    this.showDirectShortcut = false;

    // Guardar que se ha rechazado para este usuario
    if (typeof localStorage !== 'undefined' && this.userCard) {
      const userId = this.userCard.id || this.userCard.usuario_id || 'unknown';
      localStorage.setItem(`pwa-shortcut-dismissed-${userId}`, Date.now().toString());
    }
  }

  private triggerBrowserInstallPrompt(): void {
    // Método para intentar trigger de instalación en escritorio
    console.log('[PWA] Triggering browser install prompt for desktop');

    // Intentar diferentes métodos según el navegador
    const userAgent = navigator.userAgent.toLowerCase();

    if (/chrome/.test(userAgent) || /chromium/.test(userAgent)) {
      // Para Chrome/Chromium - intentar dispatch del evento
      this.dispatchInstallEvent();
    } else if (/firefox/.test(userAgent)) {
      // Para Firefox - crear shortcut directo
      this.createFirefoxShortcut();
    } else if (/edge/.test(userAgent)) {
      // Para Edge - intentar método de Edge
      this.dispatchInstallEvent();
    } else {
      // Fallback genérico
      this.createGenericShortcut();
    }
  }

  private dispatchInstallEvent(): void {
    // Intentar disparar el evento de instalación
    try {
      // Crear y disparar evento personalizado
      const installEvent = new CustomEvent('beforeinstallprompt', {
        bubbles: true,
        cancelable: true
      });

      // Añadir método prompt al evento
      (installEvent as any).prompt = () => {
        console.log('[PWA] Custom prompt triggered');
        // Aquí podríamos mostrar nuestra propia UI de instalación
        this.showCustomInstallDialog();
      };

      window.dispatchEvent(installEvent);

      // Si tenemos el evento, intentar usarlo
      if ((installEvent as any).prompt) {
        (installEvent as any).prompt();
      }

    } catch (error) {
      console.warn('[PWA] Could not dispatch install event:', error);
      this.createGenericShortcut();
    }
  }

  private showCustomInstallDialog(): void {
    // Mostrar dialog personalizado para instalación
    const userName = this.userCard?.name || this.userCard?.nombre || 'esta tarjeta';

    if (confirm(`¿Quieres instalar la tarjeta de ${userName} como una aplicación?\n\nEsto creará un acceso directo en tu escritorio.`)) {
      this.createDesktopShortcut();
    }
  }

  private createFirefoxShortcut(): void {
    // Para Firefox, intentar usar la API de manifesto
    console.log('[PWA] Creating Firefox shortcut');
    this.createGenericShortcut();
  }

  private createGenericShortcut(): void {
    // Crear acceso directo genérico
    console.log('[PWA] Creating generic desktop shortcut');

    // Intentar abrir en nueva ventana para simular app
    const currentUrl = window.location.href;
    const appName = this.userCard?.name || 'Tarjeta Digital';

    // Abrir en ventana de app
    const appWindow = window.open(
      currentUrl,
      '_blank',
      'width=400,height=600,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes'
    );

    if (appWindow) {
      // Configurar la ventana como app
      appWindow.document.title = appName;
      console.log('[PWA] Opened as app window');
    }
  }

  private createDesktopShortcut(): void {
    // Crear acceso directo en escritorio (limitado por seguridad del navegador)
    console.log('[PWA] Attempting to create desktop shortcut');

    const currentUrl = window.location.href;
    const appName = this.userCard?.name || 'Tarjeta Digital';

    // Crear enlace de descarga de shortcut
    const shortcutData = `[InternetShortcut]\nURL=${currentUrl}\nIconIndex=0`;
    const blob = new Blob([shortcutData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName}.url`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log('[PWA] Desktop shortcut file created');
  }
}
