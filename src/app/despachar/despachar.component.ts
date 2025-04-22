import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, ListboxModule,
    SelectButtonModule, EditorModule
   ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Input() modoVisualizacion: boolean = false;
  @Input() vehiculoParaMostrar: any;

  mostrarDespacho: boolean = false;
  tipoSeleccionado: any = { name: 'DM', value: 'DM' };
  tiposDespacho = [
    { name: 'DM', value: 'DM' },
    { name: 'TRANSITO', value: 'TRANSITO' }
  ];
  despacho: any = {
    tipo: '',
    vin: '',
    motorista: '',
    bl: '',
    copiaBL: '',
    duca: '',
    tarja: '',
    observaciones: ''
  };
  vinsRegistrados: any[] = [];
  vinSeleccionado: any;
  constructor(
    private messageService: MessageService,
    private vehiculoService: VehiculoService
  ) {}
  abrirDialogo() {
    this.mostrarDespacho = true;
    this.tipoSeleccionado = this.tiposDespacho[0];
    this.cargarVinsRegistrados();
  }
  cerrarDialogo() {
    this.mostrarDespacho = false;
    this.limpiarFormulario();
    this.cerrar.emit();
  }
  cambiarTipoDespacho() {
    this.limpiarFormulario();
  }
  getHeaderText(): string {
    if (this.modoVisualizacion) {
      return `Detalle de Despacho ${this.despacho.tipo}`;
    }
    return this.tipoSeleccionado?.value === 'TRANSITO'
      ? 'Despacho TRANSITO'
      : 'Despacho DM';
  }
  seleccionarVin(event: any) {
    if (event.value) {
      this.despacho.vin = event.value.vin;
    }
  }
  guardarDespacho() {
    this.despacho.tipo = this.tipoSeleccionado.value;
    if (this.tipoSeleccionado.value === 'DM') {
      console.log('Guardando DM:', this.despacho);
    } else {
      console.log('Guardando TRANSITO:', this.despacho);
    }
    this.cerrarDialogo();
  }
  private limpiarFormulario() {
    this.despacho = {
      tipo: this.tipoSeleccionado.value,
      vin: this.despacho.vin,
      motorista: '',
      bl: '',
      copiaBL: '',
      duca: '',
      tarja: '',
      observaciones: ''
    };
  }
  cargarVinsRegistrados() {
    this.vinsRegistrados = this.vehiculoService.obtenerVehiculos()
      .filter(v => v.vin)
      .map(v => ({
        vin: v.vin,
        marca: v.marca || 'Sin marca',
        anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A'
      }));
  }
  ngOnInit() {
    if (this.modoVisualizacion && this.vehiculoParaMostrar) {
      this.mostrarDespacho = true;
      this.despacho = { ...this.vehiculoParaMostrar };
      this.tipoSeleccionado = this.vehiculoParaMostrar.bl
        ? this.tiposDespacho[0]
        : this.tiposDespacho[1];
    }
  }
}
