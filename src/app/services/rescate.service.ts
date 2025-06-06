import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Rescate } from '../interfaces/rescate';
import { environment } from '../../enviroments/enviroment';
@Injectable({
  providedIn: 'root'
})
export class RescateService {
 private readonly baseUrl = `${environment.baseUrl}/rescates`;
  private http = inject(HttpClient);

  /**
   * GET: /api/rescates
   * Devuelve todos los rescates registrados
   */
  getRescates(): Observable<Rescate[]> {
    return this.http.get<Rescate[]>(this.baseUrl).pipe(
      tap(lista => console.log('Rescates recibidos:', lista)),
      catchError(this.handleError)
    );
  }

  /**
   * GET: /api/rescates/{idRescate}
   * Obtiene un rescate por su ID
   */
  getRescatePorId(idRescate: number): Observable<Rescate> {
    const url = `${this.baseUrl}/${idRescate}`;
    return this.http.get<Rescate>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET: /api/rescates/bybl/{numeroBL}
   * Obtiene todos los rescates asociados a un númeroBL
   */
  getRescatesPorBL(numerobl: string): Observable<Rescate[]> {
    const url = `${this.baseUrl}/bybl/${encodeURIComponent(numerobl)}`;
    return this.http.get<Rescate[]>(url).pipe(
      tap(l => console.log(`Rescates para BL ${numerobl}:`, l)),
      catchError(this.handleError)
    );
  }

  /**
   * POST: /api/rescates
   * Agrega un nuevo rescate.
   * El backend espera un objeto Rescate completo en el body.
   */
   agregarRescate(rescate: Rescate): Observable<Rescate> {
    return this.http.post<Rescate>(this.baseUrl, rescate).pipe(
      tap(nuevo => console.log('Rescate creado en backend:', nuevo)),
      catchError(this.handleError)
    );
  }

  /**
   * PUT: /api/rescates/{idRescate}
   * Actualiza un rescate existente.
   * El ID en la URL y el idRescate en el body deben coincidir.
   */
  actualizarRescate(rescate: Rescate): Observable<void> {
    const url = `${this.baseUrl}/${rescate.idRescate}`;
    return this.http.put<void>(url, rescate)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE: /api/rescates/{idRescate}
   * Elimina un rescate por su ID
   */
  eliminarRescate(idRescate: number): Observable<void> {
    const url = `${this.baseUrl}/${idRescate}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Manejo básico de errores HTTP */
  private handleError(error: HttpErrorResponse) {
    console.error('Error en RescateService:', error);
    let mensaje = 'Ocurrió un error en la petición.';
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (error.status === 400) {
      // El backend envía BadRequest("No existe vehículo con ese NúmeroBL.") en caso de FK violado
      mensaje = error.error ?? 'Solicitud inválida.';
    }
    return throwError(() => new Error(mensaje));
  }
}
