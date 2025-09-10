import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Detectar si el dispositivo es móvil para reducir animaciones
   */
  isMobileDevice(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
  }

  /**
   * Detectar si el usuario prefiere movimiento reducido
   */
  prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Optimizar animaciones basado en el dispositivo y preferencias
   */
  shouldUseReducedAnimations(): boolean {
    return this.isMobileDevice() || this.prefersReducedMotion();
  }

  /**
   * Lazy load de imágenes con Intersection Observer
   */
  setupLazyLoading(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset['src'] || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores que no soportan Intersection Observer
      images.forEach((img: any) => {
        img.src = img.dataset.src;
      });
    }
  }

  /**
   * Precargar recursos críticos
   */
  preloadCriticalResources(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const criticalResources: string[] = [
      // Agregar URLs de recursos críticos aquí
      // Ejemplo: '/assets/images/logo.png'
    ];

    criticalResources.forEach((resource: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'image'; // o 'style', 'script', etc.
      document.head.appendChild(link);
    });
  }

  /**
   * Debounce para eventos frecuentes como scroll o resize
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Throttle para eventos que necesitan ejecutarse regularmente
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Medir performance de carga
   */
  measurePageLoad(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalPageLoad: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      };

      console.log('Performance Metrics:', metrics);
    });
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  /**
   * Optimizar fuentes web
   */
  optimizeFonts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Precargar fuentes críticas
    const criticalFonts: string[] = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalFonts.forEach((fontUrl: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'style';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Cargar la fuente de manera asíncrona
      setTimeout(() => {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = fontUrl;
        document.head.appendChild(styleLink);
      }, 100);
    });
  }
}