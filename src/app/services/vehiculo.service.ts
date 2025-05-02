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

  private normalizarVehiculo(vehiculo: any): any {
    return {
      ...vehiculo,
      vin: vehiculo.vin || '',
      numeroBL: vehiculo.numeroBL || vehiculo.bl || '',
      numeroTarja: vehiculo.numeroTarja || vehiculo.tarja || '',
      fechaIngreso: vehiculo.fechaIngreso || vehiculo.fecha || new Date().toISOString(),
      despacho: vehiculo.despacho ? {
        tipo: vehiculo.despacho.tipo || '',
        motorista: vehiculo.despacho.motorista || '',
        notadelevante: vehiculo.despacho.notadelevante || '',
        bl: vehiculo.despacho.bl || vehiculo.numeroBL || vehiculo.bl || '',
        copiaBL: vehiculo.despacho.copiaBL || '',
        duca: vehiculo.despacho.duca || '',
        tarja: vehiculo.despacho.tarja || vehiculo.numeroTarja || vehiculo.tarja || '',
        observaciones: vehiculo.despacho.observaciones || ''
      } : null,
      estado: vehiculo.estado || 'Disponible'
    };
  }

  agregarVehiculo(vehiculo: any) {
    const vehiculoNormalizado = this.normalizarVehiculo(vehiculo);
    this.vehiculos.push(vehiculoNormalizado);
    this.guardarEnLocalStorage();
  }

  obtenerVehiculoPorVin(vin: string): any | undefined {
    const vehiculo = this.vehiculos.find(v => v.vin === vin);
    return vehiculo ? this.normalizarVehiculo(vehiculo) : undefined;
  }

  obtenerVehiculos(): any[] {
    return this.vehiculos.map(v => this.normalizarVehiculo(v));
  }

  actualizarVehiculo(vehiculoActualizado: any): boolean {
    const index = this.vehiculos.findIndex(v => v.vin === vehiculoActualizado.vin);
    if (index !== -1) {
      this.vehiculos[index] = this.normalizarVehiculo(vehiculoActualizado);
      this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }

  actualizarDespacho(datosDespacho: any): boolean {
    const index = this.vehiculos.findIndex(v => v.vin === datosDespacho.vin);
    if (index === -1) return false;

    const vehiculo = this.vehiculos[index];

    // Actualiza el objeto despacho completo
    vehiculo.despacho = {
      tipo: datosDespacho.tipo,
      vin: datosDespacho.vin,
      motorista: datosDespacho.motorista,
      notadelevante: datosDespacho.notadelevante || '',
      bl: datosDespacho.tipo === 'DM' ? datosDespacho.bl : '',
      copiaBL: datosDespacho.tipo === 'TRANSITO' ? datosDespacho.copiaBL : '',
      duca: datosDespacho.duca,
      tarja: datosDespacho.tipo === 'TRANSITO' ? datosDespacho.tarja : '',
      observaciones: datosDespacho.observaciones || ''
    };

    // Actualiza campos directos del vehículo
    vehiculo.estado = 'Deshabilitado';
    vehiculo.numeroBL = vehiculo.despacho.bl;
    vehiculo.numeroTarja = vehiculo.despacho.tarja;

    this.guardarEnLocalStorage();
    return true;
  }
}
