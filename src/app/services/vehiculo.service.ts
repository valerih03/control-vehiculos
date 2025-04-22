import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private readonly STORAGE_KEY = 'vehiculos_registrados';
  private vehiculos: any[] = [];

  constructor() {
    this.cargarDesdeLocalStorage();
  }
  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.vehiculos = datos ? JSON.parse(datos) : [];
  }
  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vehiculos));
  }
  agregarVehiculo(vehiculo: any) {
    this.vehiculos.push({...vehiculo});
    this.guardarEnLocalStorage();
  }

  obtenerVehiculoPorVin(vin: string): any | undefined {
    return this.vehiculos.find(v => v.vin === vin);
  }

  obtenerVehiculos() {
    return [...this.vehiculos];
  }
  actualizarVehiculo(vehiculoActualizado: any) {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = {...vehiculoActualizado};
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }
  actualizarDespacho(datosDespacho: any): boolean {
    const vehiculo = this.vehiculos.find(v => v.vin === datosDespacho.vin);
    if (!vehiculo) {
      console.error('Vehículo no encontrado con VIN:', datosDespacho.vin);
      return false;
    }

    if (datosDespacho.bl) {
      vehiculo.bl      = datosDespacho.bl;
      vehiculo.duca    = datosDespacho.duca;
      vehiculo.despacho = 'DM';
    }
    else if (datosDespacho.copiaBL) {
      vehiculo.copiaBL = datosDespacho.copiaBL;
      vehiculo.duca    = datosDespacho.duca;
      vehiculo.tarja   = datosDespacho.tarja;
      vehiculo.despacho = 'TRANSITO';
    }

    this.guardarEnLocalStorage();
    return true;
  }
}
