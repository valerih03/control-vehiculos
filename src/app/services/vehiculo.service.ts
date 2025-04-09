import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  // Usamos un arreglo local para almacenar los vehículos
  private vehiculos: any[] = [];

  agregarVehiculo(vehiculo: any) {
    this.vehiculos.push(vehiculo);  // Agregar el vehículo al arreglo
  }
  obtenerVehiculos() {
    return this.vehiculos;  // Retornar los vehículos almacenados
  }
  // Actualizar un vehículo en el arreglo
  actualizarVehiculo(vehiculoActualizado: any) {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = vehiculoActualizado;
    }
  }
}
