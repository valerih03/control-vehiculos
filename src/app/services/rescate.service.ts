import { Injectable } from '@angular/core';
import { Rescate } from '../interfaces/rescate';
@Injectable({
  providedIn: 'root'
})
export class RescateService {
  private readonly STORAGE_KEY = 'rescates_registrados';
  private rescates: Rescate[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.rescates = datos ? JSON.parse(datos) : [];
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.rescates));
  }

 //Agrega un nuevo rescate al almacenamiento
  agregarRescate(rescate: Rescate): void {
    this.rescates.push({ ...rescate });
    this.guardarEnLocalStorage();
  }

  //Devuelve un rescate por su ID
  obtenerRescatePorId(idRescate: number): Rescate | undefined {
    return this.rescates.find(r => r.idRescate === idRescate);
  }

 //Devuelve la lista completa de rescates
  obtenerRescates(): Rescate[] {
    return [...this.rescates];
  }

  //Actualiza un rescate existente
  actualizarRescate(rescateActualizado: Rescate): boolean {
    const index = this.rescates.findIndex(r => r.idRescate === rescateActualizado.idRescate);
    if (index !== -1) {
      this.rescates[index] = { ...rescateActualizado };
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }

  // Busca un rescate por su número de bl
  obtenerRescatePorBL(numerobl: string): Rescate | undefined {
    return this.rescates.find(r => r.numerobl === numerobl);
  }

  //Devuelve todos los rescates con un número BL dado
  obtenerRescatesPorBL(numerobl: string): Rescate[] {
    return this.rescates.filter(r => r.numerobl === numerobl);
  }
}
