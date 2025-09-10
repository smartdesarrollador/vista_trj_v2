import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
  DigitalCard,
  DigitalCardResponse,
} from '../interfaces/digital-card.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PublicDigitalCardService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Obtener tarjeta digital por slug (acceso público)
   * No requiere autenticación
   */
  getDigitalCardBySlug(slug: string): Observable<DigitalCard | null> {
    return this.http
      .get<DigitalCardResponse>(`${this.baseUrl}/tarjetas/${slug}`)
      .pipe(
        map((response) => {
          if (!response || !response.data) return null;
          return response.data;
        }),
        catchError((error) => {
          console.error('Error obteniendo tarjeta digital pública:', error);
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

    // Debe ser activa y pública para acceso público
    if (!data.is_active || !data.is_public) {
      return false;
    }

    // Validar personal_info (debe existir para mostrar)
    if (!data.personal_info || !data.personal_info.name) {
      return false;
    }

    return true;
  }
}
