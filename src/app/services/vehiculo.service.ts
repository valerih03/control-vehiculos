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
    /* localStorage.removeItem(this.STORAGE_KEY); */
  }
  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vehiculos));
  }
  agregarVehiculo(vehiculo: any) {
    const vehiculoNormalizado = {
      ...vehiculo,
      bl: vehiculo.numeroBL,       // Mapea numeroBL -> bl
      tarja: vehiculo.numeroTarja, // Mapea numeroTarja -> tarja
      fecha: vehiculo.fechaIngreso // Mapea fechaIngreso -> fecha
    };
    // Elimina los nombres antiguos para evitar duplicados
    /* delete vehiculoNormalizado.numeroBL;
    delete vehiculoNormalizado.numeroTarja;
    delete vehiculoNormalizado.fechaIngreso; */
    this.vehiculos.push(vehiculoNormalizado);
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
      // Mantén la estructura consistente
      this.vehiculos[index] = {
        ...vehiculoActualizado,
        // Asegúrate de mantener estos campos aunque el formulario no los envíe
        despacho: this.vehiculos[index].despacho,
        estado: this.vehiculos[index].estado
      };
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
      vehiculo.bl = datosDespacho.bl;
      vehiculo.fecha = new Date().toISOString(); // o usa la fecha del formulario
      vehiculo.despacho = {
        tipo: 'DM',
        duca: datosDespacho.duca,
        motorista: datosDespacho.motorista,
        observaciones: datosDespacho.observaciones
      };
    }
    else if (datosDespacho.copiaBL) {
      vehiculo.copiaBL = datosDespacho.copiaBL;
      vehiculo.tarja = datosDespacho.tarja;
      vehiculo.fecha = new Date().toISOString();
      vehiculo.despacho = {
        tipo: 'TRANSITO',
        duca: datosDespacho.duca,
        motorista: datosDespacho.motorista,
        observaciones: datosDespacho.observaciones
      };
    }
    this.guardarEnLocalStorage();
    return true;
  }
}
