import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
  DigitalCard,
  CreateDigitalCardData,
  UpdateDigitalCardData,
  DigitalCardToggleStatus,
  DigitalCardResponse,
  DigitalCardListResponse,
} from '../interfaces/digital-card.interface';
import { ApiService } from '../core/http/api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DigitalCardService {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);
  private readonly DIGITAL_CARDS_ENDPOINT = 'digital-cards';
  private readonly baseUrl = environment.apiUrl;

  constructor() {}

  /**
   * Obtener todas las tarjetas digitales del usuario autenticado
   */
  getUserDigitalCards(): Observable<DigitalCard[]> {
    return this.apiService
      .get<DigitalCardListResponse>(this.DIGITAL_CARDS_ENDPOINT)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error obteniendo tarjetas digitales:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener una tarjeta digital específica por slug (público - sin autenticación)
   */
  getDigitalCardBySlug(slug: string): Observable<DigitalCard | null> {
    return this.http
      .get<DigitalCardResponse>(`${this.baseUrl}/tarjetas/${slug}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error obteniendo tarjeta digital por slug:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtener una tarjeta digital específica por slug (autenticado)
   */
  getDigitalCardById(slug: string): Observable<DigitalCard> {
    return this.apiService
      .get<DigitalCardResponse>(`${this.DIGITAL_CARDS_ENDPOINT}/${slug}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error obteniendo tarjeta digital:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crear nueva tarjeta digital
   */
  createDigitalCard(data: CreateDigitalCardData): Observable<DigitalCard> {
    return this.apiService
      .post<DigitalCardResponse>(this.DIGITAL_CARDS_ENDPOINT, data)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error creando tarjeta digital:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar tarjeta digital existente
   */
  updateDigitalCard(
    slug: string,
    data: UpdateDigitalCardData
  ): Observable<DigitalCard> {
    return this.apiService
      .put<DigitalCardResponse>(`${this.DIGITAL_CARDS_ENDPOINT}/${slug}`, data)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error actualizando tarjeta digital:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Eliminar tarjeta digital
   */
  deleteDigitalCard(slug: string): Observable<boolean> {
    return this.apiService
      .delete(`${this.DIGITAL_CARDS_ENDPOINT}/${slug}`)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error eliminando tarjeta digital:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cambiar estado de tarjeta digital (activa/pública)
   */
  toggleDigitalCardStatus(
    slug: string,
    status: DigitalCardToggleStatus
  ): Observable<DigitalCard> {
    return this.apiService
      .put<DigitalCardResponse>(
        `${this.DIGITAL_CARDS_ENDPOINT}/${slug}/toggle-status`,
        status
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error cambiando estado de tarjeta digital:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Método de compatibilidad: obtiene datos de tarjeta para visualización pública
   * Para mantener compatibilidad con el código existente
   * Prioriza el endpoint público para evitar errores de autenticación
   */
  getDigitalCardData(): Observable<DigitalCard | null> {
    // Usar directamente el endpoint público por slug conocido
    return this.getDigitalCardBySlug('jeans-malon-reyna').pipe(
      catchError((error) => {
        console.error('Error obteniendo datos de tarjeta:', error);
        return of(null);
      })
    );
  }

  /**
   * Validar estructura de datos de tarjeta digital
   */
  validateDigitalCard(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // Validar campos obligatorios de la API
    if (
      typeof data.id !== 'number' ||
      !data.slug ||
      typeof data.is_active !== 'boolean' ||
      typeof data.is_public !== 'boolean'
    ) {
      return false;
    }

    // Validar personal_info (puede ser null)
    if (data.personal_info !== null) {
      if (!data.personal_info || !data.personal_info.name) {
        return false;
      }
    }

    // Validar contact_info (puede ser null)
    if (data.contact_info !== null && data.contact_info) {
      // Si existe contact_info, al menos debe tener email o phone
      if (!data.contact_info.email && !data.contact_info.phone) {
        return false;
      }
    }

    // Validar about_info (opcional y puede ser null)
    if (data.about_info && data.about_info !== null) {
      if (
        !Array.isArray(data.about_info.skills) ||
        typeof data.about_info.experience !== 'number'
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validar datos de creación de tarjeta digital
   */
  validateCreateDigitalCardData(data: CreateDigitalCardData): boolean {
    if (!data || typeof data !== 'object') return false;

    // Validar personal_info obligatorio
    if (!data.personal_info || !data.personal_info.name) {
      return false;
    }

    // Validar about_info si existe
    if (data.about_info && data.about_info.skills && !Array.isArray(data.about_info.skills)) {
      return false;
    }

    return true;
  }
}
