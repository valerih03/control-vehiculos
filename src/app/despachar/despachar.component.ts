import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [ CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule,
    DropdownModule, SelectButtonModule, EditorModule, InputTextareaModule,TagModule ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() modoVisualizacion = false;
  @Input() vehiculoParaMostrar: any;
  @Input() vinsRegistrados: any[] = [];

  @Output() guardarDespacho = new EventEmitter<any>();

  vinSeleccionado: any = null;

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
  tipoSeleccionado = { name: 'DM', value: 'DM' };
  tiposDespacho = [
    { name: 'DM', value: 'DM' },
    { name: 'TRANSITO', value: 'TRANSITO' }
  ];
  constructor(
    private messageService: MessageService,
    private vehiculoService: VehiculoService
  ) {}
  ngOnInit() {
    if (this.modoVisualizacion && this.vehiculoParaMostrar) {
      this.despacho = { ...this.vehiculoParaMostrar };
      this.tipoSeleccionado = this.vehiculoParaMostrar.bl
        ? this.tiposDespacho[0]
        : this.tiposDespacho[1];
    }
  }
  getHeaderText(): string {
    if (this.modoVisualizacion) {
      return `Detalle de Despacho ${this.despacho.tipo}`;
    }
    return this.tipoSeleccionado.value === 'TRANSITO'
      ? 'Despacho TRANSITO'
      : 'Despacho DM';
  }
  onShow() {
    this.vinsRegistrados = this.vehiculoService.obtenerVehiculos()
      .filter(v => v.vin)
      .map(v => ({
        vin: v.vin,
        marca: v.marca || 'Sin marca',
        anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A'
      }));
    // Limpiar formulario
    if (!this.modoVisualizacion) {
      this.despacho = {
        tipo: this.tipoSeleccionado.value,
        vin: '',
        motorista: '',
        bl: '',
        copiaBL: '',
        duca: '',
        tarja: '',
        observaciones: ''
      };
      this.tipoSeleccionado = { name: 'DM', value: 'DM' };
      this.vinSeleccionado = null;
    }
  }
  cerrarDialogo() {
    this.visibleChange.emit(false);
  }
  cambiarTipoDespacho() {
    const vinActual = this.despacho.vin;
    this.despacho = {
      tipo: this.tipoSeleccionado.value,
      vin: vinActual,
      motorista: this.despacho.motorista,
      bl: '',
      copiaBL: '',
      duca: '',
      tarja: '',
      observaciones: ''
    };
  }
  seleccionarVin(event: any) {
    if (!event.value) {
      return;
    }
    const vin = event.value.vin;
    this.despacho.vin = vin;
    this.vinSeleccionado = event.value;

    const veh = this.vehiculoService.obtenerVehiculos()
      .find(v => v.vin === vin);

    if (veh && veh.despacho) {
      // Cargar despachos previos
      this.despacho.motorista     = veh.motorista     || '';
      this.despacho.bl            = veh.bl            || '';
      this.despacho.copiaBL       = veh.copiaBL       || '';
      this.despacho.duca          = veh.duca          || '';
      this.despacho.tarja         = veh.tarja         || '';
      this.despacho.observaciones = veh.observaciones || '';
      this.tipoSeleccionado       = veh.bl ? this.tiposDespacho[0] : this.tiposDespacho[1];
    } else {
      // Limpiar todos los campos excepto VIN
      this.despacho = {
        vin: vin,
        motorista: '',  // si también quieres conservarlo, puedes hacerlo
        bl: '',
        copiaBL: '',
        duca: '',
        tarja: '',
        observaciones: ''
      };
      // Reiniciar el tipo de despacho u otras propiedades si hace falta
      this.cambiarTipoDespacho();
    }
  }

  onGuardar() {
    this.despacho.tipo = this.tipoSeleccionado.value;
    this.guardarDespacho.emit(this.despacho);
    this.visibleChange.emit(false);
  }
}
