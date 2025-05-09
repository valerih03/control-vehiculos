import { Injectable } from '@angular/core';
import { Vehiculo } from '../interfaces/vehiculo';
import { DespachoService } from './despacho.service';
import { RescateService } from './rescate.service';
@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly STORAGE_KEY = 'vehiculos_registrados';
  private vehiculos: Vehiculo[] = [];

  constructor(
    private despachoService: DespachoService,
    private rescateService: RescateService
  ) {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.vehiculos = datos ? JSON.parse(datos) : [];
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

  actualizarEstadosAbandono(umbralDias: number = 30): void {
    const hoy = new Date().getTime();
    this.vehiculos.forEach(v => {
      const ingreso = new Date(v.fechaIngreso!).getTime();
      const diasTranscurridos = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));

      const tieneDespacho = !!this.despachoService.obtenerDespachoPorVin(v.vin);
      const tieneRescate = !!this.rescateService.obtenerRescatePorBL(v.numeroBL);

      if (!tieneDespacho && !tieneRescate) {
        // Si supera el umbral, marcamos abandono
        if (diasTranscurridos > umbralDias) {
          v.estado = 'Abandono';
        }
      }
    });
    this.guardarEnLocalStorage();
  }

}
