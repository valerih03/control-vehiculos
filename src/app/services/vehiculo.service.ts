import { Injectable, inject } from '@angular/core';
import { Vehiculo } from '../interfaces/vehiculo';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly baseUrl = `${environment.baseUrl}/vehiculos`;
  private http = inject(HttpClient);

   /** Obtiene todos los vehículos */
  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.baseUrl).pipe(
      tap((vehiculos) => {
        console.log('Vehiculos recibidos:', vehiculos);
      }),
      catchError(this.handleError)
    );
  }

  /** Obtiene un vehículo por su VIN */
  getVehiculoPorVin(vin: string): Observable<Vehiculo> {
    const url = `${this.baseUrl}/${encodeURIComponent(vin)}`;
    return this.http.get<Vehiculo>(url).pipe(
      tap((vehiculo) => {
        console.log(`Vehículo recibido para VIN ${vin}:`, vehiculo);
      }),
      catchError(this.handleError)
    );
  }

  /** Crea un nuevo vehículo (POST) */
  agregarVehiculo(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, vehiculo).pipe(
      tap((nuevoVehiculo) => {
        console.log('Vehículo creado:', nuevoVehiculo);
      }),
      catchError(this.handleError)
    );
  }

  /** Actualiza un vehículo existente (PUT) */
  actualizarVehiculo(vehiculo: Vehiculo): Observable<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(vehiculo.vin)}`;
    return this.http.put<void>(url, vehiculo).pipe(
      tap(() => {
        console.log(`Vehículo con VIN ${vehiculo.vin} actualizado.`);
      }),
      catchError(this.handleError)
    );
  }

  /** Elimina un vehículo por VIN (DELETE) */
  eliminarVehiculo(vin: string): Observable<void> {
    const url = `${this.baseUrl}/${encodeURIComponent(vin)}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`Vehículo con VIN ${vin} eliminado.`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Llama al endpoint PUT /api/vehiculos/actualizar-abandono?dias={umbral}
   * para recalcular estados a "Abandono" si supera el umbral.
   */
  actualizarEstadosAbandono(umbralDias: number = 30): Observable<void> {
    const url = `${this.baseUrl}/actualizar-abandono`;
    const params = new HttpParams().set('dias', umbralDias.toString());
    return this.http.put<void>(url, null, { params }).pipe(
      tap(() => {
        console.log(`Estados de abandono actualizados con umbral de ${umbralDias} días.`);
      }),
      catchError(this.handleError)
    );
  }

  /** Manejo básico de errores HTTP */
  private handleError(error: HttpErrorResponse) {
    console.error('Error en VehiculoService:', error);
    let mensaje = 'Ocurrió un error en la petición.';
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (error.status === 409) {
      mensaje = error.error ?? 'Conflicto al guardar el vehículo.';
    }
    return throwError(() => new Error(mensaje));
  }

}
