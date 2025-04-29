import { Injectable } from '@angular/core';
import { Ingreso } from '../interfaces/ingreso';

@Injectable({
  providedIn: 'root',
})
export class IngresoService {
  private readonly STORAGE_KEY = 'ingresos_registrados';
  private ingresos: Ingreso[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.ingresos = datos ? JSON.parse(datos) : [];
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ingresos));
  }

  agregarIngreso(ingreso: Ingreso) {
    this.ingresos.push({ ...ingreso });
    this.guardarEnLocalStorage();
  }

  obtenerIngresoPorTarja(tarja: string): Ingreso | undefined {
    return this.ingresos.find(i => i.tarja === tarja);
  }

  obtenerIngresos(): Ingreso[] {
    return [...this.ingresos];
  }

  actualizarIngreso(ingresoActualizado: Ingreso): boolean {
    const index = this.ingresos.findIndex(i => i.tarja === ingresoActualizado.tarja);
    if (index !== -1) {
      this.ingresos[index] = { ...ingresoActualizado };
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }
}
