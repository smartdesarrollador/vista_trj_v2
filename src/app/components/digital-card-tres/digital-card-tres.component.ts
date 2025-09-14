import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  Renderer2,
  Inject,
  PLATFORM_ID,
  Input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DigitalCard } from '../../interfaces/digital-card.interface';
import { DigitalCardService } from '../../services/digital-card.service';
import { PerformanceService } from '../../core/performance/performance.service';
import { DynamicQrComponent } from '../dynamic-qr/dynamic-qr.component';
import { CambiarTarjetaComponent } from '../cambiar-tarjeta/cambiar-tarjeta.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-digital-card-tres',
  standalone: true,
  imports: [CommonModule, DynamicQrComponent, CambiarTarjetaComponent],
  templateUrl: './digital-card-tres.component.html',
  styleUrl: './digital-card-tres.component.css',
})
export class DigitalCardTresComponent implements OnInit, OnDestroy {
  // Input para recibir datos externos
  @Input() cardData: DigitalCard | null = null;
  @Input() hideShareButtons = false;
  @Input() shareUrl: string | null = null; // <-- NUEVO INPUT

  // Propiedades existentes para compatibilidad
  digitalCard: DigitalCard | null = null;
  isLoading = true;
  error: string | null = null;
  currentEdge: string | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private isHovering = false;
  private rafId: number | null = null;

  // Computed signal para unificar datos
  readonly displayData = computed(() => {
    return this.cardData || this.digitalCard;
  });

  // Share functionality properties
  showShareMenu = false;
  copyButtonText = 'Copiar enlace';

  // Current slug for navigation
  currentSlug = '';

  // La URL para compartir ahora es dinámica
  private get cardUrl(): string {
    if (this.shareUrl) {
      return this.shareUrl;
    }
    if (isPlatformBrowser(this.platformId)) {
      return window.location.href;
    }
    return '';
  }

  private subscription: Subscription = new Subscription();

  constructor(
    private digitalCardService: DigitalCardService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private performanceService: PerformanceService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Get current slug from route params
    this.activatedRoute.params.subscribe(params => {
      this.currentSlug = params['slug'] || '';
    });

    // Solo cargar del servicio si no hay datos externos
    if (!this.cardData) {
      this.loadDigitalCard();
    } else {
      // Si hay datos externos, configurar directamente
      this.isLoading = false;
      this.error = null;
    }

    // Solo inicializar efectos cuánticos en el navegador con delay para mejorar performance
    if (isPlatformBrowser(this.platformId)) {
      // Verificar si se deben reducir las animaciones por performance
      if (this.performanceService.shouldUseReducedAnimations()) {
        // En móvil o con preferencia de movimiento reducido, no inicializar efectos pesados
        return;
      }

      // Delay la inicialización de efectos para priorizar la carga de contenido
      setTimeout(() => {
        this.initializeQuantumEffects();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  /**
   * Cargar datos de la tarjeta digital desde el servicio
   */
  private loadDigitalCard(): void {
    this.isLoading = true;
    this.error = null;

    const cardSubscription = this.digitalCardService
      .getDigitalCardBySlug('default-user')
      .subscribe({
        next: (data) => {
          if (data && this.digitalCardService.validateDigitalCard(data)) {
            this.digitalCard = data;
            this.isLoading = false;
          } else if (data === null) {
            this.error =
              'No se encontró tarjeta digital. Crea una nueva tarjeta para empezar.';
            this.isLoading = false;
          } else {
            this.error = 'Datos de tarjeta digital inválidos';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al cargar los datos de la tarjeta digital';
          this.isLoading = false;
          console.error('Error loading digital card:', err);
        },
      });

    this.subscription.add(cardSubscription);
  }

  /**
   * Inicializar efectos cuánticos y holográficos
   */
  // Getters para acceder a los datos
  get personal_info() {
    return this.displayData()?.personal_info;
  }

  get contact_info() {
    return this.displayData()?.contact_info;
  }

  get about_info() {
    return this.displayData()?.about_info;
  }

  get profileImageUrl(): string | null {
    const photo = this.displayData()?.personal_info?.photo;
    if (!photo) return null;

    // Si ya es una URL completa, devolverla tal como está
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }

    // Construir URL completa para imágenes locales usando urlDominioApi
    return `${environment.urlDominioApi}/${photo}`;
  }

  private initializeQuantumEffects(): void {
    // Crear partículas magnéticas dinámicas
    this.createMagneticParticles();

    // Inicializar seguimiento del cursor para efectos holográficos
    this.initializeCursorTracking();
  }

  /**
   * Crear partículas magnéticas que siguen el cursor
   */
  private createMagneticParticles(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Reducir número de partículas para mejor performance
    setTimeout(() => {
      const magneticField =
        this.elementRef.nativeElement.querySelector('.magnetic-field');
      if (magneticField) {
        for (let i = 0; i < 4; i++) {
          // Reducido de 8 a 4 partículas
          const particle = this.renderer.createElement('div');
          this.renderer.addClass(particle, 'magnetic-particle');

          const colors = ['#00ffff', '#ff0080', '#8000ff', '#00ff80'];
          const color = colors[i % colors.length];
          const size = Math.random() * 3 + 2; // Tamaño ligeramente menor

          this.renderer.setStyle(particle, 'width', `${size}px`);
          this.renderer.setStyle(particle, 'height', `${size}px`);
          this.renderer.setStyle(particle, 'background', color);
          this.renderer.setStyle(
            particle,
            'box-shadow',
            `0 0 ${size * 3}px ${color}`
          ); // Menos blur
          this.renderer.setStyle(
            particle,
            'top',
            `${Math.random() * 80 + 10}%`
          );
          this.renderer.setStyle(
            particle,
            'left',
            `${Math.random() * 80 + 10}%`
          );
          this.renderer.setStyle(
            particle,
            'animation',
            `magneticField ${8 + Math.random() * 4}s ease-in-out infinite ${
              Math.random() * 2
            }s`
          );
          this.renderer.setStyle(particle, 'will-change', 'transform'); // Optimización GPU

          this.renderer.appendChild(magneticField, particle);
        }
      }
    }, 300); // Reducido delay
  }

  /**
   * Inicializar seguimiento del cursor para efectos holográficos
   */
  private initializeCursorTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.renderer.listen(
      this.elementRef.nativeElement,
      'mousemove',
      (e: MouseEvent) => {
        this.updateMousePosition(e);
      }
    );

    this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => {
      this.isHovering = true;
      this.startQuantumAnimation();
    });

    this.renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => {
      this.isHovering = false;
    });
  }

  /**
   * Actualizar posición del cursor para efectos holográficos
   */
  private updateMousePosition(e: MouseEvent): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    this.mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    this.updateHolographicGlow();
  }

  /**
   * Actualizar brillo holográfico basado en la posición del cursor
   */
  private updateHolographicGlow(): void {
    const cardElement =
      this.elementRef.nativeElement.querySelector('.card-container');
    if (cardElement) {
      cardElement.style.setProperty('--mouse-x', `${this.mouseX}%`);
      cardElement.style.setProperty('--mouse-y', `${this.mouseY}%`);
    }
  }

  /**
   * Iniciar animación cuántica
   */
  private startQuantumAnimation(): void {
    if (!isPlatformBrowser(this.platformId) || this.rafId) return;

    const animate = () => {
      if (this.isHovering) {
        this.updateQuantumField();
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(animate);
  }

  /**
   * Actualizar campo cuántico de partículas
   */
  private updateQuantumField(): void {
    const particles =
      this.elementRef.nativeElement.querySelectorAll('.magnetic-particle');
    particles.forEach((particle: HTMLElement, index: number) => {
      const distance = this.calculateDistance(
        particle,
        this.mouseX,
        this.mouseY
      );
      const attraction = Math.max(0, 1 - distance / 100);

      if (attraction > 0.3) {
        const scale = 1 + attraction;
        const brightness = 1 + attraction * 0.5;
        particle.style.transform = `scale(${scale})`;
        particle.style.filter = `brightness(${brightness}) blur(${
          0.5 - attraction * 0.3
        }px)`;
      }
    });
  }

  /**
   * Calcular distancia entre partícula y cursor
   */
  private calculateDistance(
    element: HTMLElement,
    mouseX: number,
    mouseY: number
  ): number {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = centerX - mouseX;
    const deltaY = centerY - mouseY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * Manejar hover en los bordes para efectos cuánticos
   */
  onEdgeHover(edge: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentEdge = edge;
    const cardElement = this.elementRef.nativeElement.querySelector(
      '.card-container'
    ) as HTMLElement;
    if (cardElement) {
      cardElement.style.transformOrigin = this.getQuantumTransformOrigin(edge);
      this.applyQuantumEdgeEffect(cardElement, edge);
    }
  }

  /**
   * Manejar salida del hover en los bordes
   */
  onEdgeLeave(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentEdge = null;
    const cardElement = this.elementRef.nativeElement.querySelector(
      '.card-container'
    ) as HTMLElement;
    if (cardElement) {
      cardElement.style.transformOrigin = 'center';
      cardElement.style.filter = '';
    }
  }

  /**
   * Obtener origen de transformación cuántica
   */
  private getQuantumTransformOrigin(edge: string): string {
    switch (edge) {
      case 'top':
        return 'center top';
      case 'bottom':
        return 'center bottom';
      case 'left':
        return 'left center';
      case 'right':
        return 'right center';
      default:
        return 'center';
    }
  }

  /**
   * Aplicar efectos cuánticos en los bordes
   */
  private applyQuantumEdgeEffect(element: HTMLElement, edge: string): void {
    const quantumEffects = {
      top: 'hue-rotate(90deg) brightness(1.2) saturate(1.3)',
      bottom: 'hue-rotate(-90deg) brightness(1.1) saturate(1.2)',
      left: 'hue-rotate(180deg) brightness(1.3) saturate(1.4)',
      right: 'hue-rotate(270deg) brightness(1.1) saturate(1.1)',
    };

    element.style.filter =
      quantumEffects[edge as keyof typeof quantumEffects] || '';
  }

  /**
   * Listener global para efectos de teclado
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Efectos especiales con teclas
    if (event.key === ' ') {
      this.triggerQuantumBurst();
    }
  }

  /**
   * Disparar ráfaga cuántica (efecto especial)
   */
  private triggerQuantumBurst(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cardElement =
      this.elementRef.nativeElement.querySelector('.card-container');
    if (cardElement) {
      cardElement.style.animation = 'none';
      setTimeout(() => {
        cardElement.style.animation =
          'holographicEntry 0.8s ease-out, liquidFloat 2s ease-in-out infinite 0.8s';
      }, 50);
    }
  }

  /**
   * Obtener iniciales del nombre para fallback de imagen
   */
  getInitials(name?: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Formatear número de teléfono para mejor visualización
   */
  formatPhone(phone?: string | null): string {
    if (!phone) return '';
    // Ejemplo: +34 600 123 456 -> +34 600 123 456
    return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }

  /**
   * Obtener dominio del email para mostrar
   */
  getEmailDomain(email?: string | null): string {
    if (!email) return '';
    return email.split('@')[1] || '';
  }

  /**
   * Generar URL limpia para mostrar del website
   */
  getCleanUrl(url?: string): string {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  /**
   * Limpiar número de teléfono para WhatsApp
   */
  getCleanPhone(phone?: string | null): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }

  /**
   * Manejar error de carga de imagen
   */
  onImageError(event: any): void {
    event.target.style.display = 'none';
    // El div con iniciales se mostrará automáticamente
  }

  /**
   * Manejar carga exitosa de imagen
   */
  onImageLoad(event: any): void {
    // Opcional: añadir efecto de fade in
    event.target.style.opacity = '1';
  }

  // ==================== SHARE FUNCTIONALITY ====================

  /**
   * Toggle share menu visibility
   */
  toggleShareMenu(): void {
    this.showShareMenu = !this.showShareMenu;
  }

  /**
   * Share to WhatsApp
   */
  shareToWhatsApp(): void {
    const text = encodeURIComponent(
      `¡Mira mi tarjeta digital! ${
        this.digitalCard?.personal_info?.name || ''
      } `
    );
    const url = encodeURIComponent(this.cardUrl);
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;

    if (isPlatformBrowser(this.platformId)) {
      window.open(whatsappUrl, '_blank', 'width=600,height=400');
    }
    this.showShareMenu = false;
  }

  /**
   * Share to Facebook
   */
  shareToFacebook(): void {
    const url = encodeURIComponent(this.cardUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    if (isPlatformBrowser(this.platformId)) {
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
    this.showShareMenu = false;
  }

  /**
   * Share to Twitter
   */
  shareToTwitter(): void {
    const text = encodeURIComponent(
      `¡Mira mi tarjeta digital! ${
        this.digitalCard?.personal_info?.name || ''
      } - Especializado en desarrollo web moderno`
    );
    const url = encodeURIComponent(this.cardUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

    if (isPlatformBrowser(this.platformId)) {
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    this.showShareMenu = false;
  }

  /**
   * Share to LinkedIn
   */
  shareToLinkedIn(): void {
    const url = encodeURIComponent(this.cardUrl);
    const title = encodeURIComponent(
      `Tarjeta Digital - ${this.digitalCard?.personal_info?.name || ''}`
    );
    const summary = encodeURIComponent(
      'Especializado en desarrollo web moderno. Conecta conmigo a través de mi tarjeta digital interactiva.'
    );
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;

    if (isPlatformBrowser(this.platformId)) {
      window.open(linkedinUrl, '_blank', 'width=600,height=400');
    }
    this.showShareMenu = false;
  }

  /**
   * Copy URL to clipboard
   */
  async copyToClipboard(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.cardUrl);
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = this.cardUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      // Cambiar texto del botón temporalmente
      this.copyButtonText = '¡Copiado!';
      setTimeout(() => {
        this.copyButtonText = 'Copiar enlace';
      }, 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      this.copyButtonText = 'Error al copiar';
      setTimeout(() => {
        this.copyButtonText = 'Copiar enlace';
      }, 2000);
    }

    this.showShareMenu = false;
  }
}
