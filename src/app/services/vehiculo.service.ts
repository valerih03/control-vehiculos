import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly STORAGE_KEY = 'vehiculos_registrados';
  private vehiculos: any[] = [];

  constructor() {
    this.cargarDesdeLocalStorage(); // ← Cargar datos al iniciar
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.vehiculos = datos ? JSON.parse(datos) : [];
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vehiculos));
  }

  agregarVehiculo(vehiculo: any) {
    if (!vehiculo.vin) {
      console.error('No se puede guardar vehículo sin VIN');
      return;
    }
    this.vehiculos.push({...vehiculo});
    this.guardarEnLocalStorage();
  }

  obtenerVehiculos() {
    return [...this.vehiculos];
  }

  actualizarVehiculo(vehiculoActualizado: any) {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = {...vehiculoActualizado};
      this.guardarEnLocalStorage(); // ← Persistir
      return true;
    }
    return false;
  }
}
