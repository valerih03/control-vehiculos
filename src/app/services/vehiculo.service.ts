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
}
