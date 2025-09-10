import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="showInstallPrompt" 
      class="pwa-install-prompt fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
    >
      <div class="bg-gradient-to-r from-black via-gray-900 to-black border border-cyan-500/30 rounded-xl p-4 backdrop-blur-md shadow-2xl">
        <!-- Close button -->
        <button 
          (click)="dismissPrompt()"
          class="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- App icon and title -->
        <div class="flex items-center mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-3 flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-white font-semibold text-sm">Instalar Tarjeta Digital</h3>
            <p class="text-gray-400 text-xs">Acceso rápido desde tu pantalla de inicio</p>
          </div>
        </div>

        <!-- Benefits -->
        <div class="space-y-1 mb-4">
          <div class="flex items-center text-xs text-gray-300">
            <svg class="w-3 h-3 text-cyan-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Funciona sin conexión
          </div>
          <div class="flex items-center text-xs text-gray-300">
            <svg class="w-3 h-3 text-cyan-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Carga más rápido
          </div>
          <div class="flex items-center text-xs text-gray-300">
            <svg class="w-3 h-3 text-cyan-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Experiencia nativa
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex space-x-2">
          <button 
            (click)="installPWA()"
            class="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity"></div>
            <span class="relative z-10">Instalar</span>
          </button>
          <button 
            (click)="dismissPrompt()"
            class="px-4 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-install-prompt {
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .pwa-install-prompt:before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg, #00ffff, #ff0080, #8000ff, #00ffff);
      background-size: 400% 400%;
      border-radius: 12px;
      z-index: -1;
      animation: borderGlow 3s ease-in-out infinite;
      opacity: 0.3;
    }

    @keyframes borderGlow {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
  `]
})
export class PwaInstallPromptComponent implements OnInit, OnDestroy {
  
  showInstallPrompt = false;
  private deferredPrompt: any = null;
  private installPromptDismissed = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePWAPrompt();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', this.handleAppInstalled);
    }
  }

  private initializePWAPrompt(): void {
    // Check if PWA is already installed
    if (this.isPWAInstalled()) {
      return;
    }

    // Check if user has previously dismissed the prompt
    if (localStorage.getItem('pwa-install-dismissed') === 'true') {
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
    
    // Listen for app installed event
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));

    // Show prompt after a delay if conditions are met
    setTimeout(() => {
      this.checkAndShowPrompt();
    }, 10000); // Show after 10 seconds
  }

  private handleBeforeInstallPrompt = (e: any): void => {
    console.log('[PWA] beforeinstallprompt event triggered');
    e.preventDefault();
    this.deferredPrompt = e;
    this.checkAndShowPrompt();
  };

  private handleAppInstalled = (e: any): void => {
    console.log('[PWA] App installed successfully');
    this.showInstallPrompt = false;
    this.deferredPrompt = null;
    
    // Store installation status
    localStorage.setItem('pwa-installed', 'true');
    
    // Show success message (optional)
    this.showSuccessMessage();
  };

  private checkAndShowPrompt(): void {
    if (this.deferredPrompt && 
        !this.installPromptDismissed && 
        !this.isPWAInstalled() &&
        this.shouldShowPrompt()) {
      this.showInstallPrompt = true;
    }
  }

  private shouldShowPrompt(): boolean {
    // Check various conditions to determine if we should show the prompt
    const hasVisitedBefore = localStorage.getItem('pwa-visited') === 'true';
    const isEngaged = this.checkUserEngagement();
    
    // Mark that user has visited
    localStorage.setItem('pwa-visited', 'true');
    
    return hasVisitedBefore || isEngaged;
  }

  private checkUserEngagement(): boolean {
    // Simple engagement check - you can enhance this
    const startTime = performance.now();
    const currentTime = Date.now();
    
    // Consider user engaged if they've been on page for more than 30 seconds
    // or if they've interacted with the page
    return (currentTime - startTime) > 30000 || 
           document.hasFocus() ||
           localStorage.getItem('user-interacted') === 'true';
  }

  private isPWAInstalled(): boolean {
    // Check if running in PWA mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           localStorage.getItem('pwa-installed') === 'true';
  }

  async installPWA(): Promise<void> {
    if (!this.deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      this.showFallbackInstructions();
      return;
    }

    try {
      // Show the install prompt
      const { outcome } = await this.deferredPrompt.prompt();
      console.log('[PWA] Install prompt outcome:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }

      // Clear the deferred prompt
      this.deferredPrompt = null;
      this.showInstallPrompt = false;

    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      this.showFallbackInstructions();
    }
  }

  dismissPrompt(): void {
    this.showInstallPrompt = false;
    this.installPromptDismissed = true;
    
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Set expiry for the dismissal (e.g., show again after 7 days)
    const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    localStorage.setItem('pwa-dismiss-expiry', expiry.toString());
  }

  private showFallbackInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';

    if (userAgent.includes('chrome') && userAgent.includes('android')) {
      instructions = 'Toca el menú de Chrome (⋮) y selecciona "Agregar a pantalla de inicio"';
    } else if (userAgent.includes('safari') && userAgent.includes('iphone')) {
      instructions = 'Toca el botón de compartir (□) y luego "Agregar a pantalla de inicio"';
    } else if (userAgent.includes('safari') && userAgent.includes('ipad')) {
      instructions = 'Toca el botón de compartir (□) y luego "Agregar a pantalla de inicio"';
    } else {
      instructions = 'Busca la opción "Agregar a pantalla de inicio" o "Instalar aplicación" en el menú de tu navegador';
    }

    // Show instructions in a simple alert or custom modal
    alert(`Para instalar esta aplicación:\n\n${instructions}`);
    this.dismissPrompt();
  }

  private showSuccessMessage(): void {
    // Optional: Show a success toast or notification
    console.log('[PWA] Installation successful! App is now available on your home screen.');
  }
}