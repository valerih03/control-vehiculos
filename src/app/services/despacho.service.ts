import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Despacho } from '../interfaces/despacho';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  // Base URL: por ejemplo "http://localhost:7076/api/despachos"
  private readonly baseUrl = `${environment.baseUrl}/despachos`;
  private http = inject(HttpClient);

  /** GET: /api/despachos
   * Devuelve la lista completa de despachos */
  getDespachos(): Observable<Despacho[]> {
    return this.http.get<Despacho[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  /** GET: /api/despachos/{idDespacho}
   * Obtiene un despacho por su ID */
  getDespachoPorId(idDespacho: number): Observable<Despacho> {
    const url = `${this.baseUrl}/${idDespacho}`;
    return this.http.get<Despacho>(url)
      .pipe(catchError(this.handleError));
  }

  /** GET: /api/despachos/byvin/{vin}
   * Obtiene el primer despacho que coincida con el VIN */
  getDespachoPorVin(vin: string): Observable<Despacho> {
    const url = `${this.baseUrl}/byvin/${encodeURIComponent(vin)}`;
    return this.http.get<Despacho>(url)
      .pipe(catchError(this.handleError));
  }

  /** GET: /api/despachos/tiposalida/{vin}
   * Obtiene el campo tipoSalida de un despacho según VIN */
  getTipoSalidaPorVin(vin: string): Observable<string> {
    const url = `${this.baseUrl}/tiposalida/${encodeURIComponent(vin)}`;
    return this.http.get<string>(url)
      .pipe(catchError(this.handleError));
  }

  /** POST: /api/despachos
   * Agrega un nuevo despacho. */
  agregarDespacho(despacho: Despacho): Observable<Despacho> {
    return this.http.post<Despacho>(this.baseUrl, despacho)
      .pipe(catchError(this.handleError));
  }

  /** PUT: /api/despachos/{idDespacho}
   * Actualiza un despacho existente. */
  actualizarDespacho(despacho: Despacho): Observable<void> {
    const url = `${this.baseUrl}/${despacho.idDespacho}`;
    return this.http.put<void>(url, despacho)
      .pipe(catchError(this.handleError));
  }

  /** DELETE: /api/despachos/{idDespacho}
   * Elimina un despacho por su ID. */
  eliminarDespacho(idDespacho: number): Observable<void> {
    const url = `${this.baseUrl}/${idDespacho}`;
    return this.http.delete<void>(url)
      .pipe(catchError(this.handleError));
  }

  /** Manejo básico de errores HTTP */
  private handleError(error: HttpErrorResponse) {
    console.error('Error en DespachoService:', error);
    let mensaje = 'Ocurrió un error en la petición.';
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (error.status === 400) {
      // El backend podría devolver BadRequest("No existe vehículo con ese VIN.") en caso de FK violado
      mensaje = error.error ?? 'Solicitud inválida.';
    }
    return throwError(() => new Error(mensaje));
  }
}
