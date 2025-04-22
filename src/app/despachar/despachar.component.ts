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
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, ListboxModule,
    SelectButtonModule
   ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent {

  /** binding para mostrar/ocultar el diálogo */
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** lista de VINs recibida desde el Dashboard */
  @Input() vinsRegistrados: any[] = [];

  /** emite el despacho al padre */
  @Output() guardarDespacho = new EventEmitter<any>();

  /** modo sólo lectura */
  @Input() modoVisualizacion: boolean = false;
  @Input() vehiculoParaMostrar: any;

  /** para el p-listbox */
  vinSeleccionado: any = null;

  despacho: any = {
    tipo: '',
    vin: '',
    bl: '',
    copiaBL: '',
    duca: '',
    tarja: ''
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

  /** Texto dinámico del header */
  getHeaderText(): string {
    if (this.modoVisualizacion) {
      return `Detalle de Despacho ${this.despacho.tipo}`;
    }
    return this.tipoSeleccionado.value === 'TRANSITO'
      ? 'Despacho TRANSITO'
      : 'Despacho DM';
  }

  /** Se dispara al abrir el diálogo */
  onShow() {
    this.vinsRegistrados = this.vehiculoService.obtenerVehiculos()
      .filter(v => v.vin)
      .map(v => ({
        vin: v.vin,
        marca: v.marca || 'Sin marca',
        anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A'
      }));
  }

  /** Cierra y notifica al padre */
  cerrarDialogo() {
    this.visibleChange.emit(false);
  }

  cambiarTipoDespacho() {
    const vinActual = this.despacho.vin;
    this.despacho = {
      tipo: this.tipoSeleccionado.value,
      vin: vinActual,
      bl: '',
      copiaBL: '',
      duca: '',
      tarja: ''
    };
  }

  seleccionarVin(event: any) {
    if (event.value) {
      this.despacho.vin = event.value.vin;
      this.vinSeleccionado = event.value;
    }
  }

  onGuardar() {
    this.despacho.tipo = this.tipoSeleccionado.value;
    this.guardarDespacho.emit(this.despacho);
    this.visibleChange.emit(false);
  }
}
