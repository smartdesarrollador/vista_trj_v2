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
import { DigitalCard } from '../../interfaces/digital-card.interface';
import { DigitalCardService } from '../../services/digital-card.service';
import { PerformanceService } from '../../core/performance/performance.service';
import { DynamicQrComponent } from '../dynamic-qr/dynamic-qr.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-futuristic-card',
  standalone: true,
  imports: [CommonModule, DynamicQrComponent],
  templateUrl: './futuristic-card.component.html',
  styleUrl: './futuristic-card.component.css',
})
export class FuturisticCardComponent implements OnInit, OnDestroy {
  // Input para recibir datos externos (mismo que digital-card)
  @Input() cardData: DigitalCard | null = null;
  @Input() hideShareButtons = false;
  @Input() shareUrl: string | null = null;

  // Propiedades existentes para compatibilidad
  digitalCard: DigitalCard | null = null;
  isLoading = true;
  error: string | null = null;

  // Propiedades específicas para efectos futuristas
  private mouseX = 0;
  private mouseY = 0;
  private isHovering = false;
  private rafId: number | null = null;
  glitchActive = false;
  particleCount = 50;
  mousePosition = { x: 0, y: 0 };

  // Computed signal para unificar datos
  readonly displayData = computed(() => {
    return this.cardData || this.digitalCard;
  });

  // Share functionality properties
  showShareMenu = false;
  copyButtonText = 'Copiar enlace';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Solo cargar del servicio si no hay datos externos
    if (!this.cardData) {
      this.loadDigitalCard();
    } else {
      // Si hay datos externos, configurar directamente
      this.isLoading = false;
      this.error = null;
    }

    // Solo inicializar efectos futuristas en el navegador con delay para mejorar performance
    if (isPlatformBrowser(this.platformId)) {
      // Verificar si se deben reducir las animaciones por performance
      if (this.performanceService.shouldUseReducedAnimations()) {
        // En móvil o con preferencia de movimiento reducido, no inicializar efectos pesados
        return;
      }

      // Delay la inicialización de efectos para priorizar la carga de contenido
      setTimeout(() => {
        this.initializeFuturisticEffects();
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

  /**
   * Inicializar efectos futuristas
   */
  private initializeFuturisticEffects(): void {
    // Crear partículas futuristas
    this.createFuturisticParticles();

    // Inicializar seguimiento del cursor para efectos holográficos
    this.initializeCursorTracking();

    // Inicializar efectos glitch aleatorios
    this.initializeGlitchEffects();

    // Inicializar sistema de partículas dinámico (FASE 3)
    this.createDynamicParticles();
  }

  /**
   * Crear partículas futuristas que siguen el cursor
   */
  private createFuturisticParticles(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const particleContainer = this.elementRef.nativeElement.querySelector('.futuristic-particles');
      if (particleContainer) {
        for (let i = 0; i < 6; i++) {
          const particle = this.renderer.createElement('div');
          this.renderer.addClass(particle, 'futuristic-particle');

          const colors = ['#00f3ff', '#bf00ff', '#00ff88', '#ff0080', '#ffb000'];
          const color = colors[i % colors.length];
          const size = Math.random() * 4 + 3;

          this.renderer.setStyle(particle, 'width', `${size}px`);
          this.renderer.setStyle(particle, 'height', `${size}px`);
          this.renderer.setStyle(particle, 'background', color);
          this.renderer.setStyle(
            particle,
            'box-shadow',
            `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}aa`
          );
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
            `futuristicFloat ${6 + Math.random() * 4}s ease-in-out infinite ${
              Math.random() * 2
            }s`
          );
          this.renderer.setStyle(particle, 'will-change', 'transform');

          this.renderer.appendChild(particleContainer, particle);
        }
      }
    }, 300);
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
      this.startFuturisticAnimation();
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

    this.mousePosition = {
      x: this.mouseX,
      y: this.mouseY
    };

    this.updateHolographicGlow();
  }

  /**
   * Actualizar brillo holográfico basado en la posición del cursor
   */
  private updateHolographicGlow(): void {
    const cardElement = this.elementRef.nativeElement.querySelector('.futuristic-container');
    if (cardElement) {
      cardElement.style.setProperty('--mouse-x', `${this.mouseX}%`);
      cardElement.style.setProperty('--mouse-y', `${this.mouseY}%`);
    }
  }

  /**
   * Iniciar animación futurista
   */
  private startFuturisticAnimation(): void {
    if (!isPlatformBrowser(this.platformId) || this.rafId) return;

    const animate = () => {
      if (this.isHovering) {
        this.updateFuturisticField();
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(animate);
  }

  /**
   * Actualizar campo futurista de partículas
   */
  private updateFuturisticField(): void {
    const particles = this.elementRef.nativeElement.querySelectorAll('.futuristic-particle');
    particles.forEach((particle: HTMLElement, index: number) => {
      const distance = this.calculateDistance(particle, this.mouseX, this.mouseY);
      const attraction = Math.max(0, 1 - distance / 150);

      if (attraction > 0.2) {
        const scale = 1 + attraction * 1.5;
        const brightness = 1 + attraction * 0.8;
        particle.style.transform = `scale(${scale}) rotate(${attraction * 180}deg)`;
        particle.style.filter = `brightness(${brightness}) hue-rotate(${attraction * 90}deg)`;
      }
    });

    // Actualizar efectos avanzados de FASE 3
    this.updateParticlesInteraction();
    this.update3DEffects();
  }

  /**
   * Calcular distancia entre partícula y cursor
   */
  private calculateDistance(element: HTMLElement, mouseX: number, mouseY: number): number {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = centerX - mouseX;
    const deltaY = centerY - mouseY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * Inicializar efectos glitch aleatorios
   */
  private initializeGlitchEffects(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setInterval(() => {
      if (Math.random() < 0.1) { // 10% probabilidad cada segundo
        this.triggerGlitchEffect();
      }
    }, 1000);
  }

  /**
   * Disparar efecto glitch
   */
  private triggerGlitchEffect(): void {
    this.glitchActive = true;
    setTimeout(() => {
      this.glitchActive = false;
    }, 200);
  }

  /**
   * Listener global para efectos de teclado
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Efectos especiales con teclas
    if (event.key === ' ') {
      this.triggerCyberBurst();
    } else if (event.key === 'g' || event.key === 'G') {
      this.activateAdvancedGlitch();
    } else if (event.key === 'h' || event.key === 'H') {
      this.createHolographicInterference();
    } else if (event.key === 'e' || event.key === 'E') {
      this.triggerEnergyBurst();
    }
  }

  /**
   * Disparar ráfaga cyber (efecto especial)
   */
  private triggerCyberBurst(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cardElement = this.elementRef.nativeElement.querySelector('.futuristic-container');
    if (cardElement) {
      cardElement.style.animation = 'none';
      setTimeout(() => {
        cardElement.style.animation = 'cyberEntry 1s ease-out, futuristicFloat 3s ease-in-out infinite 1s';
      }, 50);
    }
  }

  // ==================== FASE 3: ADVANCED EFFECTS ====================

  /**
   * Crear sistema de partículas dinámico
   */
  private createDynamicParticles(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const particleContainer = this.elementRef.nativeElement.querySelector('.futuristic-particles');
    if (!particleContainer) return;

    // Limpiar partículas existentes
    const existingParticles = particleContainer.querySelectorAll('.dynamic-particle');
    existingParticles.forEach((particle: Element) => particle.remove());

    // Crear nuevas partículas
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle(particleContainer, i);
    }
  }

  /**
   * Crear partícula individual
   */
  private createParticle(container: HTMLElement, index: number): void {
    const particle = this.renderer.createElement('div');
    this.renderer.addClass(particle, 'dynamic-particle');

    const colors = ['var(--cyber-blue)', 'var(--electric-purple)', 'var(--neon-green)', 'var(--plasma-pink)', 'var(--quantum-gold)'];
    const color = colors[index % colors.length];

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 4;
    const animationDuration = Math.random() * 3 + 2;

    this.renderer.setStyle(particle, 'position', 'absolute');
    this.renderer.setStyle(particle, 'width', `${size}px`);
    this.renderer.setStyle(particle, 'height', `${size}px`);
    this.renderer.setStyle(particle, 'background', color);
    this.renderer.setStyle(particle, 'border-radius', '50%');
    this.renderer.setStyle(particle, 'left', `${left}%`);
    this.renderer.setStyle(particle, 'top', '100%');
    this.renderer.setStyle(particle, 'pointer-events', 'none');
    this.renderer.setStyle(particle, 'animation', `particleFloat ${animationDuration}s ease-in-out ${animationDelay}s infinite`);
    this.renderer.setStyle(particle, 'box-shadow', `0 0 ${size * 3}px ${color}`);
    this.renderer.setStyle(particle, 'z-index', '1');

    this.renderer.appendChild(container, particle);
  }

  /**
   * Actualizar partículas con interacción de cursor
   */
  private updateParticlesInteraction(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const particles = this.elementRef.nativeElement.querySelectorAll('.dynamic-particle');
    particles.forEach((particle: HTMLElement) => {
      const rect = particle.getBoundingClientRect();
      const containerRect = this.elementRef.nativeElement.getBoundingClientRect();

      const particleX = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
      const particleY = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;

      const distance = Math.sqrt(
        Math.pow(particleX - this.mouseX, 2) +
        Math.pow(particleY - this.mouseY, 2)
      );

      if (distance < 20) {
        const repulsion = Math.max(0, 1 - distance / 20);
        const offsetX = (particleX - this.mouseX) * repulsion * 2;
        const offsetY = (particleY - this.mouseY) * repulsion * 2;

        this.renderer.setStyle(particle, 'transform',
          `translate(${offsetX}px, ${offsetY}px) scale(${1 + repulsion})`);
        this.renderer.setStyle(particle, 'filter',
          `brightness(${1 + repulsion}) hue-rotate(${repulsion * 180}deg)`);
      } else {
        this.renderer.setStyle(particle, 'transform', 'translate(0, 0) scale(1)');
        this.renderer.setStyle(particle, 'filter', 'brightness(1) hue-rotate(0deg)');
      }
    });
  }

  /**
   * Activar modo glitch avanzado con distorsión
   */
  private activateAdvancedGlitch(): void {
    this.glitchActive = true;

    const cardElement = this.elementRef.nativeElement.querySelector('.cyber-card');
    if (cardElement) {
      // Aplicar distorsión temporal
      this.renderer.setStyle(cardElement, 'filter',
        'hue-rotate(180deg) saturate(2) brightness(1.2) contrast(1.5)');

      setTimeout(() => {
        this.renderer.setStyle(cardElement, 'filter',
          'hue-rotate(90deg) saturate(0.5) brightness(0.8)');
      }, 100);

      setTimeout(() => {
        this.renderer.setStyle(cardElement, 'filter', 'none');
        this.glitchActive = false;
      }, 200);
    }
  }

  /**
   * Crear efecto de interferencia holográfica
   */
  private createHolographicInterference(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const holoFrame = this.elementRef.nativeElement.querySelector('.holo-frame');
    if (!holoFrame) return;

    const interference = this.renderer.createElement('div');
    this.renderer.addClass(interference, 'holo-interference');

    this.renderer.setStyle(interference, 'position', 'absolute');
    this.renderer.setStyle(interference, 'top', '0');
    this.renderer.setStyle(interference, 'left', '0');
    this.renderer.setStyle(interference, 'right', '0');
    this.renderer.setStyle(interference, 'bottom', '0');
    this.renderer.setStyle(interference, 'background', `
      repeating-linear-gradient(
        ${Math.random() * 360}deg,
        transparent 0px,
        rgba(0, 243, 255, 0.1) 1px,
        transparent 2px
      )
    `);
    this.renderer.setStyle(interference, 'pointer-events', 'none');
    this.renderer.setStyle(interference, 'animation', 'holoScan 2s linear infinite');
    this.renderer.setStyle(interference, 'z-index', '10');

    this.renderer.appendChild(holoFrame, interference);

    // Remover después de la animación
    setTimeout(() => {
      this.renderer.removeChild(holoFrame, interference);
    }, 2000);
  }

  /**
   * Actualizar efectos 3D basados en la posición del cursor
   */
  private update3DEffects(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const card = this.elementRef.nativeElement.querySelector('.cyber-card');
    if (!card) return;

    const centerX = 50;
    const centerY = 50;

    const rotateY = (this.mouseX - centerX) / 10;
    const rotateX = -(this.mouseY - centerY) / 10;

    this.renderer.setStyle(card, 'transform',
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`);

    // Actualizar sombra paralela
    const shadowOffsetX = (this.mouseX - centerX) / 5;
    const shadowOffsetY = (this.mouseY - centerY) / 5;

    this.renderer.setStyle(card, 'box-shadow', `
      ${shadowOffsetX}px ${shadowOffsetY}px 30px rgba(0, 243, 255, 0.3),
      ${shadowOffsetX * 0.5}px ${shadowOffsetY * 0.5}px 15px rgba(191, 0, 255, 0.2),
      0 0 50px rgba(0, 255, 136, 0.1)
    `);
  }

  /**
   * Activar efecto de ráfaga de energía
   */
  private triggerEnergyBurst(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = this.elementRef.nativeElement.querySelector('.futuristic-container');
    if (!container) return;

    const burst = this.renderer.createElement('div');
    this.renderer.addClass(burst, 'energy-burst');

    this.renderer.setStyle(burst, 'position', 'absolute');
    this.renderer.setStyle(burst, 'top', '50%');
    this.renderer.setStyle(burst, 'left', '50%');
    this.renderer.setStyle(burst, 'width', '0');
    this.renderer.setStyle(burst, 'height', '0');
    this.renderer.setStyle(burst, 'background', 'radial-gradient(circle, rgba(0,243,255,0.8) 0%, transparent 70%)');
    this.renderer.setStyle(burst, 'border-radius', '50%');
    this.renderer.setStyle(burst, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(burst, 'pointer-events', 'none');
    this.renderer.setStyle(burst, 'z-index', '100');
    this.renderer.setStyle(burst, 'animation', 'energyBurst 0.8s ease-out forwards');

    // Agregar keyframe para energyBurst si no existe
    const style = this.renderer.createElement('style');
    this.renderer.setProperty(style, 'innerHTML', `
      @keyframes energyBurst {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 400px;
          height: 400px;
          opacity: 0;
        }
      }
    `);
    this.renderer.appendChild(document.head, style);

    this.renderer.appendChild(container, burst);

    setTimeout(() => {
      this.renderer.removeChild(container, burst);
      this.renderer.removeChild(document.head, style);
    }, 800);
  }

  // ==================== UTILITY METHODS ====================

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
  }

  /**
   * Manejar carga exitosa de imagen
   */
  onImageLoad(event: any): void {
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
      `¡Mira mi tarjeta digital futurista! ${
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
      `¡Mira mi tarjeta digital futurista! ${
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
      `Tarjeta Digital Futurista - ${this.digitalCard?.personal_info?.name || ''}`
    );
    const summary = encodeURIComponent(
      'Especializado en desarrollo web moderno. Conecta conmigo a través de mi tarjeta digital futurista e interactiva.'
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

  // ==================== TRACKBY FUNCTIONS ====================

  /**
   * TrackBy function for skills array
   */
  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  /**
   * TrackBy function for rain drops
   */
  trackByDrop(index: number, drop: number): number {
    return drop;
  }
}
