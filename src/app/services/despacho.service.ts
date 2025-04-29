import { Injectable } from '@angular/core';
import { Despacho } from '../interfaces/despacho';

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private readonly STORAGE_KEY = 'despachos_registrados';
  private despachos: Despacho[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.despachos = datos ? JSON.parse(datos) : [];
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.despachos));
  }

  agregarDespacho(despacho: Despacho) {
    this.despachos.push({ ...despacho });
    this.guardarEnLocalStorage();
  }

  obtenerDespachoPorId(idDespacho: number): Despacho | undefined {
    return this.despachos.find(d => d.idDespacho === idDespacho);
  }

  obtenerDespachos(): Despacho[] {
    return [...this.despachos];
  }

  actualizarDespacho(despachoActualizado: Despacho): boolean {
    const index = this.despachos.findIndex(d => d.idDespacho === despachoActualizado.idDespacho);
    if (index !== -1) {
      this.despachos[index] = { ...despachoActualizado };
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }
}
