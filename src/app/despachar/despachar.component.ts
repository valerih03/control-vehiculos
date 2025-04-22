import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { ListboxModule } from 'primeng/listbox';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, ListboxModule ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Input() modoVisualizacion = false;
  @Input() vehiculoParaMostrar: any;
  // Variables para mostrar formularios
  mostrarDM = false;
  mostrarTransito = false;
  //para filtrar
  vinsRegistrados: any[] = [];
  vinSeleccionado: any;

  despachoDM = {
    vin: '',
    bl: '',
    duca: ''
  };
  despachoTransito = {
    vin: '',
    copiaBL: '',
    duca: '',
    tarja: ''
  };
  constructor(private messageService: MessageService,
    private vehiculoService: VehiculoService) {}
    cargarVinsRegistrados() {
      const vehiculos = this.vehiculoService.obtenerVehiculos();
      console.log('Vehículos obtenidos:', vehiculos); // ← Agrega esto para debug

      this.vinsRegistrados = vehiculos
        .filter(v => v.vin) // Filtra vehículos con VIN válido
        .map(v => ({
          vin: v.vin,
          marca: v.marca || 'Sin marca',
          anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A'
        }));

      console.log('VINs registrados:', this.vinsRegistrados); // ← Verifica esto
    }
    // En despachar.ts
pruebaServicio() {
  console.log('Vehículos en servicio:', this.vehiculoService.obtenerVehiculos());
}
    // Método para manejar la selección
    seleccionarVin(event: any) {
      if (event.value) {
        this.despachoDM.vin = event.value.vin;
        this.despachoTransito.vin = event.value.vin;
      }
    }
    ngOnInit() {
      this.pruebaServicio();
      this.cargarVinsRegistrados(); // Cargar siempre, no solo en modo visualización

      if (this.modoVisualizacion && this.vehiculoParaMostrar) {
        this.cargarDatosParaVisualizacion();
      }
    }
  cargarDatosParaVisualizacion() {
    if (this.vehiculoParaMostrar.bl) {
      // Es un despacho DM
      this.despachoDM = { ...this.vehiculoParaMostrar };
      this.mostrarDM = true;
    } else if (this.vehiculoParaMostrar.copiaBL) {
      // Es un despacho TRANSITO
      this.despachoTransito = { ...this.vehiculoParaMostrar };
      this.mostrarTransito = true;
    }
  }
  seleccionarTipo(tipo: string) {
    if (this.modoVisualizacion) return;
    if (tipo === 'DM') {
      this.mostrarDM = true;
    } else {
      this.mostrarTransito = true;
    }
  }
  guardarDM() {
    if (this.modoVisualizacion) return;
    console.log('Guardando DM:', this.despachoDM);
    this.mostrarDM = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Despacho DM registrado'
    });
    this.limpiarFormularios();
    this.cerrar.emit();
  }
  guardarTransito() {
    if (this.modoVisualizacion) return;
    console.log('Guardando TRANSITO:', this.despachoTransito);
    this.mostrarTransito = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Despacho Tránsito registrado'
    });
    this.limpiarFormularios();
    this.cerrar.emit();
  }
  
  limpiarFormularios() {
    if (this.modoVisualizacion) return;
    this.despachoDM = { vin: '', bl: '', duca: '' };
    this.despachoTransito = { vin: '', copiaBL: '', duca: '', tarja: '' };
  }
  cancelar() {
    this.limpiarFormularios();
    this.cerrar.emit();
  }
}
