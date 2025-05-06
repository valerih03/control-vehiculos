import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private readonly STORAGE_KEY = 'vehiculos_registrados';
  private vehiculos: any[] = [];

  constructor(private messageService: MessageService) {
    this.inicializarServicio();
  }

  private inicializarServicio() {
    this.cargarDesdeLocalStorage();
    // Verificar estados cada hora (3600000 ms)
    setInterval(() => {
      this.verificarEstadosVehiculos();
      this.messageService.add({
        severity: 'info',
        summary: 'Actualización',
        detail: 'Estados de vehículos verificados',
        life: 3000
      });
    }, 3600000);
  }

  private cargarDesdeLocalStorage() {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    this.vehiculos = datos ? JSON.parse(datos) : [];
    this.verificarEstadosVehiculos(); // Verificar estados al cargar
    //localStorage.clear();
  }

  private guardarEnLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.vehiculos));
  }

  private normalizarVehiculo(vehiculo: any): any {
    const fechaIngreso = new Date(vehiculo.fechaIngreso || vehiculo.fecha || new Date());
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));

    let estadoCalculado = '';

    if (vehiculo.despacho) {
      estadoCalculado = 'Deshabilitado';
    } else if (vehiculo.fechaRescate) {
      // Si ha sido rescatado, sin importar los días, sigue disponible
      estadoCalculado = 'Disponible (Rescatado)';
    } else if (diasTranscurridos > 20) {
      estadoCalculado = 'Abandono';
    } else {
      estadoCalculado = 'Disponible';
    }

    return {
      ...vehiculo,
      vin: vehiculo.vin || '',
      numeroBL: vehiculo.numeroBL || vehiculo.bl || '',
      numeroTarja: vehiculo.numeroTarja || vehiculo.tarja || '',
      fechaIngreso: fechaIngreso.toISOString(),
      diasTranscurridos,
      estado: estadoCalculado,
      fechaUltimoEstado: new Date().toISOString()
    };
  }

  verificarEstadosVehiculos(): void {
    const hoy = new Date();
    let cambiosRealizados = false;

    this.vehiculos = this.vehiculos.map(vehiculo => {
      const vehiculoNormalizado = this.normalizarVehiculo(vehiculo);
      if (vehiculoNormalizado.estado !== vehiculo.estado) {
        cambiosRealizados = true;
      }
      return vehiculoNormalizado;
    });

    if (cambiosRealizados) {
      this.guardarEnLocalStorage();
    }
  }

  agregarVehiculo(vehiculo: any) {
    const vehiculoNormalizado = this.normalizarVehiculo(vehiculo);
    this.vehiculos.push(vehiculoNormalizado);
    this.guardarEnLocalStorage();
    return vehiculoNormalizado;
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

    // Actualizar datos de despacho
    vehiculo.despacho = {
      tipo: datosDespacho.tipo,
      motorista: datosDespacho.motorista,
      notadelevante: datosDespacho.notadelevante || '',
      bl: datosDespacho.tipo === 'DM' ? datosDespacho.bl : '',
      copiaBL: datosDespacho.tipo === 'TRANSITO' ? datosDespacho.copiaBL : '',
      duca: datosDespacho.duca || '',
      tarja: datosDespacho.tipo === 'TRANSITO' ? datosDespacho.tarja : '',
      observaciones: datosDespacho.observaciones || '',
      fechaDespacho: new Date().toISOString()
    };

    // Actualizar estado y campos relacionados
    vehiculo.estado = 'Deshabilitado';
    vehiculo.numeroBL = vehiculo.despacho.bl || vehiculo.numeroBL;
    vehiculo.numeroTarja = vehiculo.despacho.tarja || vehiculo.numeroTarja;
    vehiculo.fechaUltimoEstado = new Date().toISOString();

    this.guardarEnLocalStorage();
    this.verificarEstadosVehiculos(); // Verificar todos los estados

    return true;
  }

  //Para rescatar vehículos abandonados
  iniciarRescateMasivo(vehiculos: any[], fechaRescate: Date): boolean {
    try {
      vehiculos.forEach(vehiculo => {
        vehiculo.estado = 'Disponible';
        vehiculo.fechaRescate = fechaRescate.toISOString();
        vehiculo.diasTranscurridos = 0;
        this.actualizarVehiculo(vehiculo);
      });
      return true;
    } catch (error) {
      console.error('Error en rescate masivo:', error);
      return false;
    }
  }
}
