import { Injectable } from '@angular/core';
import { Vehiculo } from '../interfaces/vehiculo';
@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly STORAGE_KEY = 'vehiculos_registrados';
  private vehiculos: Vehiculo[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.vehiculos = datos ? JSON.parse(datos) : [];
    //localStorage.clear();
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vehiculos));
  }

  agregarVehiculo(vehiculo: Vehiculo) {
    this.vehiculos.push({ ...vehiculo });
    this.guardarEnLocalStorage();
  }

  obtenerVehiculoPorVin(vin: string): Vehiculo | undefined {
    return this.vehiculos.find(v => v.vin === vin);
  }

  obtenerVehiculos(): Vehiculo[] {
    return [...this.vehiculos];
  }

  actualizarVehiculo(vehiculoActualizado: Vehiculo): boolean {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = { ...vehiculoActualizado };
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }

}
