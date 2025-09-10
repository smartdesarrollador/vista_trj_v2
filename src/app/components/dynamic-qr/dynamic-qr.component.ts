import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface QRAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  data: string;
  type: 'vcard' | 'url' | 'whatsapp' | 'vcf-inline';
}

@Component({
  selector: 'app-dynamic-qr',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-container relative">
      <!-- QR Code Display -->
      <div class="qr-display bg-white p-4 rounded-2xl shadow-lg border border-cyan-500/20 relative overflow-hidden">
        <!-- Holographic Effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <!-- QR Code -->
        <div class="relative z-10 flex justify-center">
          <div 
            [innerHTML]="currentQRSvg" 
            class="qr-code-svg w-48 h-48 md:w-56 md:h-56 flex items-center justify-center transition-all duration-300"
          ></div>
        </div>
        
        <!-- Action Label -->
        <div class="mt-4 text-center relative z-10">
          <p class="text-gray-700 text-sm font-medium">
            {{ currentAction.description }}
          </p>
          <div class="flex items-center justify-center mt-2">
            <span class="text-cyan-600 text-xs">{{ currentAction.icon }}</span>
            <span class="text-gray-600 text-xs ml-1 font-medium">{{ currentAction.label }}</span>
          </div>
        </div>
      </div>

      <!-- Action Selector -->
      <div class="mt-4 flex flex-col items-center">
        <button
          (click)="toggleActions()"
          class="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-full hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
          </svg>
          <span class="text-sm font-medium">Cambiar acción</span>
        </button>

        <!-- Actions Menu -->
        <div 
          *ngIf="showActions" 
          class="mt-3 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-cyan-500/20 overflow-hidden shadow-2xl animate-fade-in"
        >
          <div class="p-2 space-y-1">
            <button
              *ngFor="let action of qrActions"
              (click)="selectAction(action)"
              [class.bg-cyan-600]="currentAction.id === action.id"
              [class.text-white]="currentAction.id === action.id"
              [class.text-gray-300]="currentAction.id !== action.id"
              [class.hover:bg-gray-700]="currentAction.id !== action.id"
              class="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left"
            >
              <span class="text-lg mr-3">{{ action.icon }}</span>
              <div>
                <div class="font-medium text-sm">{{ action.label }}</div>
                <div class="text-xs opacity-75">{{ action.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-container {
      max-width: 320px;
      margin: 0 auto;
    }

    .qr-display::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #00ffff, #ff0080, #8000ff, #00ffff);
      background-size: 400% 400%;
      border-radius: 18px;
      z-index: -1;
      animation: borderGlow 3s ease-in-out infinite;
      opacity: 0.7;
    }

    @keyframes borderGlow {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .qr-code-svg svg {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .qr-container {
        max-width: 280px;
      }
      
      .qr-code-svg {
        width: 180px !important;
        height: 180px !important;
      }
    }
  `]
})
export class DynamicQrComponent implements OnInit {

  showActions = false;
  currentQRSvg = '';
  currentAction: QRAction;

  qrActions: QRAction[] = [
    {
      id: 'vcard',
      label: 'Guardar Contacto',
      description: 'Escanéame para guardar mi contacto',
      icon: '👤',
      data: 'https://tarjeta-jeans.smartdigitaltec.com/assets/qr/jeans-contact.vcf',
      type: 'vcard'
    },
    {
      id: 'website',
      label: 'Visitar Portfolio',
      description: 'Escanéame para visitar mi portfolio',
      icon: '🌐',
      data: 'https://portafolio.smartdigitaltec.com',
      type: 'url'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Directo',
      description: 'Escanéame para escribirme por WhatsApp',
      icon: '💬',
      data: 'https://wa.me/51955365043?text=Hola%20Jeans%2C%20vi%20tu%20tarjeta%20digital%20y%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20tus%20servicios%20de%20desarrollo%20web.',
      type: 'whatsapp'
    },
    {
      id: 'vcf-inline',
      label: 'Contacto Offline',
      description: 'Escanéame para guardar contacto (funciona sin internet)',
      icon: '📱',
      data: this.generateInlineVCard(),
      type: 'vcf-inline'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.currentAction = this.qrActions[0]; // Default to vCard
  }

  ngOnInit(): void {
    this.generateQRCode(this.currentAction.data);
  }

  toggleActions(): void {
    this.showActions = !this.showActions;
  }

  selectAction(action: QRAction): void {
    this.currentAction = action;
    this.generateQRCode(action.data);
    this.showActions = false;
  }

  private generateQRCode(data: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Usar API de QR Code generator online con mejor configuración
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&bgcolor=FFFFFF&color=000000&format=png&ecc=M&margin=1`;
    
    // Crear imagen con fallback mejorado
    this.currentQRSvg = `
      <div class="qr-loading relative">
        <!-- Loading placeholder -->
        <div class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
          <div class="text-2xl">⏳</div>
        </div>
        
        <!-- QR Image -->
        <img src="${qrApiUrl}" 
             alt="${this.currentAction.description}" 
             class="qr-image w-full h-full rounded-lg shadow-sm relative z-10" 
             style="opacity: 0; transition: opacity 0.5s ease;"
             onerror="this.style.display='none'; this.parentElement.querySelector('.qr-fallback').style.display='flex';" 
             onload="this.style.opacity='1'; this.parentElement.querySelector('.animate-pulse').style.display='none';">
        
        <!-- Fallback -->
        <div class="qr-fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-100 to-purple-100 rounded-lg flex-col border-2 border-dashed border-cyan-300">
          <div class="text-3xl mb-2">${this.currentAction.icon}</div>
          <div class="text-sm text-gray-700 font-medium text-center px-4">
            ${this.currentAction.label}
          </div>
          <div class="text-xs text-gray-500 mt-1 text-center px-4">
            ${this.currentAction.description}
          </div>
        </div>
      </div>
    `;
  }

  private generateInlineVCard(): string {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:JEANS ENRIQUE MALON REYNA
N:MALON REYNA;JEANS ENRIQUE;;;
ORG:Smart Digital Tec
TITLE:Desarrollador Web
TEL;TYPE=CELL:+51955365043
EMAIL:sistema5000smart@gmail.com
URL:https://portafolio.smartdigitaltec.com
ADR;TYPE=HOME:;;Lima;;PE;
NOTE:Especializado en desarrollo web moderno con Angular, React, Laravel y diseño centrado en el usuario.
X-SOCIALPROFILE;TYPE=facebook:https://www.facebook.com/jeansenrique.malonreyna
END:VCARD`;
    
    return vcard.replace(/\n/g, '%0A');
  }
}