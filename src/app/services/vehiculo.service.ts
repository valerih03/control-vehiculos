import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private vehiculos: any[] = [];

  agregarVehiculo(vehiculo: any) {
    this.vehiculos.push({...vehiculo});
  }

  obtenerVehiculos() {
    return [...this.vehiculos]; // Retorna copia del arreglo
  }
  actualizarVehiculo(vehiculoActualizado: any) {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = {...vehiculoActualizado};
      return true;
    }
    return false;
  }
  obtenerPorVin(vin: string) {
    return this.vehiculos.find(v => v.vin === vin);
  }
  actualizarDespacho(datos: any) {
    const vehiculo = this.vehiculos.find(v => v.vin === datos.vin);
    if (vehiculo) {
      Object.assign(vehiculo, datos); // Fusiona los datos
    }
  }
}
