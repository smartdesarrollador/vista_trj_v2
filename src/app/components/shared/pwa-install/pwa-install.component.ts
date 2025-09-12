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
    
    // Si no funciona el prompt automático, mostrar instrucciones específicas por plataforma
    const userAgent = navigator.userAgent.toLowerCase();
    const userName = this.userCard?.name || this.userCard?.nombre || 'esta tarjeta';
    
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
    } else {
      // Desktop (Windows/Mac/Linux)
      mensaje = `Para instalar la tarjeta de ${userName}:\n\n` +
                `1. Busca el icono de instalación (⊞ +) en la barra de direcciones\n` +
                `2. Haz clic en "Instalar" cuando aparezca\n` +
                `3. O usa Ctrl+D (Cmd+D en Mac) para añadir a favoritos\n\n` +
                `¡La tarjeta estará disponible como una app!`;
    }
    
    alert(mensaje);
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
}
