import { AutoCompleteModule } from 'primeng/autocomplete';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [ CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule,
    AutoCompleteModule, SelectButtonModule, EditorModule, InputTextareaModule,TagModule ],
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
   // Variables para control de errores
   mostrarErrorVin = false;
   mostrarErrorMotorista = false;
   mostrarErrorBl = false;
   mostrarErrorCopiaBl = false;
   mostrarErrorDuca = false;
   mostrarErrorTarja = false;
   intentoGuardar = false;

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

vinFiltrados: any[] = [];

filtrarVins(event: any) {
  const query = event.query.toLowerCase();
  this.vinFiltrados = this.vinsRegistrados.filter(v =>
    v.vin.toLowerCase().includes(query)
  );
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
    this.intentoGuardar = false;
    this.resetearErrores();
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
    // Verificamos si el evento tiene un valor (puede ser undefined si se borra la selección)
    if (!event) {
        this.despacho.vin = '';
        this.resetearErrores();
        return;
    }
    const vin = event.vin; // Ahora el objeto viene directamente en el evento
    this.despacho.vin = vin;
    this.vinSeleccionado = event; // Guardamos el objeto completo

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

      // Seleccionar tipo de despacho basado en los datos
      this.tipoSeleccionado = this.tiposDespacho.find(t => t.value === veh.tipoDespacho) ||
                             (veh.bl ? this.tiposDespacho[0] : this.tiposDespacho[1]);
    } else {
      // Limpiar todos los campos excepto VIN
      this.despacho = {
        vin: vin,
        motorista: '',
        bl: '',
        copiaBL: '',
        duca: '',
        tarja: '',
        observaciones: ''
      };
      this.cambiarTipoDespacho();
    }
    // Reseteamos todos los errores al seleccionar un VIN
    this.resetearErrores();
}
  private resetearErrores(): void {
    this.mostrarErrorVin = false;
    this.mostrarErrorMotorista = false;
    this.mostrarErrorBl = false;
    this.mostrarErrorCopiaBl = false;
    this.mostrarErrorDuca = false;
    this.mostrarErrorTarja = false;
  }
  onGuardar() {
    this.intentoGuardar = true;
    if (!this.validarFormulario()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos obligatorios'
      });
      return;
    }

    this.despacho.tipo = this.tipoSeleccionado.value;
    this.guardarDespacho.emit(this.despacho);
    this.visibleChange.emit(false);
}
validarFormulario(): boolean {
  let valido = true;
  // Solo validar si ya se intentó guardar
  if (this.intentoGuardar) {
    this.mostrarErrorVin = !this.despacho.vin;
    if (this.mostrarErrorVin) valido = false;

    this.mostrarErrorMotorista = !this.despacho.motorista;
    if (this.mostrarErrorMotorista) valido = false;

    if (this.tipoSeleccionado.value === 'DM') {
      this.mostrarErrorBl = !this.despacho.bl;
      this.mostrarErrorDuca = !this.despacho.duca;
      if (this.mostrarErrorBl || this.mostrarErrorDuca) valido = false;
    } else {
      this.mostrarErrorCopiaBl = !this.despacho.copiaBL;
      this.mostrarErrorTarja = !this.despacho.tarja;
      this.mostrarErrorDuca = !this.despacho.duca;
      if (this.mostrarErrorCopiaBl || this.mostrarErrorTarja || this.mostrarErrorDuca) valido = false;
    }
  }
  return valido;
}
  formularioValido(): boolean {
    return this.validarFormulario();
  }
}
