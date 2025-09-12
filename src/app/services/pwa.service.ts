import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any = null;
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  private isInstalledSubject = new BehaviorSubject<boolean>(false);

  public isInstallable$ = this.isInstallableSubject.asObservable();
  public isInstalled$ = this.isInstalledSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePwaPrompt();
      this.checkIfInstalled();
    }
  }

  private initializePwaPrompt(): void {
    // Escuchar el evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('[PWA] beforeinstallprompt event fired');
      
      // Prevenir que Chrome 67 y anteriores muestren automáticamente el prompt
      e.preventDefault();
      
      // Guardar el evento para poder triggerearlo después
      this.promptEvent = e;
      
      // Notificar que la app es instalable
      this.isInstallableSubject.next(true);
    });

    // Escuchar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App successfully installed');
      this.isInstalledSubject.next(true);
      this.isInstallableSubject.next(false);
      this.promptEvent = null;
    });

    // Verificar si ya está ejecutándose como PWA
    if (this.isRunningStandalone()) {
      this.isInstalledSubject.next(true);
    }
  }

  private checkIfInstalled(): void {
    // Verificar diferentes formas de detectar si está instalada
    const isStandalone = this.isRunningStandalone();
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSStandalone = isIOS && (navigator as any).standalone;

    const isInstalled = isStandalone || isInStandaloneMode || isIOSStandalone;
    
    if (isInstalled) {
      console.log('[PWA] App detected as already installed');
      this.isInstalledSubject.next(true);
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.promptEvent) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      // Mostrar el prompt de instalación
      this.promptEvent.prompt();
      
      // Esperar la respuesta del usuario
      const choiceResult = await this.promptEvent.userChoice;
      
      console.log('[PWA] User choice:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        this.isInstallableSubject.next(false);
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error prompting install:', error);
      return false;
    } finally {
      // Limpiar el prompt event
      this.promptEvent = null;
    }
  }

  public isRunningStandalone(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    return (
      // Chrome/Edge
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (navigator as any).standalone ||
      // Android Chrome
      document.referrer.includes('android-app://') ||
      // Windows
      (navigator as any).standalone === true
    );
  }

  public canInstall(): boolean {
    return this.promptEvent !== null;
  }

  public isInstalled(): boolean {
    return this.isInstalledSubject.value;
  }

  public isInstallable(): boolean {
    return this.isInstallableSubject.value;
  }

  // Detectar diferentes plataformas para mostrar instrucciones específicas
  public getPlatformInstallInstructions(): string {
    if (!isPlatformBrowser(this.platformId)) return 'Instrucciones disponibles en el navegador';

    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'iOS: Toca el botón de compartir y selecciona "Añadir a la pantalla de inicio"';
    } else if (/android/.test(userAgent)) {
      if (/chrome/.test(userAgent)) {
        return 'Android Chrome: Toca el menú (3 puntos) y selecciona "Añadir a la pantalla de inicio"';
      } else if (/firefox/.test(userAgent)) {
        return 'Android Firefox: Toca el menú y selecciona "Instalar"';
      }
      return 'Android: Busca la opción "Añadir a la pantalla de inicio" en el menú del navegador';
    } else if (/windows/.test(userAgent)) {
      return 'Windows: Haz clic en el icono de instalación en la barra de direcciones';
    } else if (/mac/.test(userAgent)) {
      return 'Mac: Haz clic en el icono de instalación en la barra de direcciones';
    }
    
    return 'Busca la opción "Instalar app" o "Añadir a la pantalla de inicio" en tu navegador';
  }

  // Verificar si el navegador soporta PWA
  public isPwaSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Obtener información del estado PWA
  public getPwaStatus(): {
    isSupported: boolean;
    isInstallable: boolean;
    isInstalled: boolean;
    canPrompt: boolean;
    platform: string;
  } {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        isSupported: false,
        isInstallable: false,
        isInstalled: false,
        canPrompt: false,
        platform: 'server'
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    let platform = 'unknown';
    
    if (/iphone|ipad|ipod/.test(userAgent)) platform = 'ios';
    else if (/android/.test(userAgent)) platform = 'android';
    else if (/windows/.test(userAgent)) platform = 'windows';
    else if (/mac/.test(userAgent)) platform = 'mac';
    else platform = 'desktop';

    return {
      isSupported: this.isPwaSupported(),
      isInstallable: this.isInstallable(),
      isInstalled: this.isInstalled(),
      canPrompt: this.canInstall(),
      platform
    };
  }
}