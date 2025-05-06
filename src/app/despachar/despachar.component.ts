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
import { AutoCompleteModule } from 'primeng/autocomplete';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [ CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule,
    DropdownModule, SelectButtonModule, EditorModule, InputTextareaModule,TagModule, AutoCompleteModule ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() modoVisualizacion = false;
  @Input() vehiculoParaMostrar: any;
  @Input() vinsRegistrados: any[] = [];
  @Input() vehiculoEditando: any;


  @Output() guardarDespacho = new EventEmitter<any>();

  vinSeleccionado: any = null;

  despacho: any = {
    tipo: '',
    vin: '',
    motorista: '',
    notadelevante: '',
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
  //edicion de despacho
  activarEdicion() {
    this.modoVisualizacion = false;
  }
  ngOnInit() {
    if (this.modoVisualizacion && this.vehiculoParaMostrar) {
            this.despacho = {
        ...this.vehiculoParaMostrar,
        ...(this.vehiculoParaMostrar.despacho || {})
      };
      console.log('Datos cargados para visualización:', this.despacho);

      if (this.despacho.despacho) {
        this.despacho = { ...this.despacho, ...this.despacho.despacho };
      }
      // Establece el tipo correcto
      this.tipoSeleccionado = this.tiposDespacho.find(
        t => t.value === this.despacho.tipo
      ) || this.tiposDespacho[0];
    }
  }
  vinFiltrados: any[] = [];
  // Variables para control de errores
  mostrarErrorVin = false;
  mostrarErrorMotorista = false;
  mostrarErrorBl = false;
  mostrarErrorCopiaBl = false;
  mostrarErrorDuca = false;
  mostrarErrorTarja = false;
  intentoGuardar = false;

  filtrarVins(event: any) {
    const query = event.query.toLowerCase();

    // Solo vehículos con estado válido, sin despacho y con VIN válido
    const vehiculosDisponibles = this.vehiculoService.obtenerVehiculos()
      .filter(v => {
        const tieneVin = v.vin && v.vin.trim() !== '';
        const sinDespacho = !v.despacho || Object.keys(v.despacho).length === 0;
        const estadoValido = (
          v.estado === 'Disponible' ||
          v.estado === 'En revisión' ||
          (v.estado === 'Abandonado' && v.rescate === true)
        );

        return tieneVin && sinDespacho && estadoValido;
      });

    this.vinFiltrados = vehiculosDisponibles
      .filter(v => v.vin.toLowerCase().includes(query))
      .map(v => ({
        vin: v.vin,
        marca: v.marca || 'Sin marca',
        anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A',
        estado: v.estado
      }));
      this.vinSeleccionado = null; // Resetear selección al filtrar
  }

  getHeaderText(): string {
    if (this.modoVisualizacion) {
      return `Detalle de Despacho - ${this.despacho.tipo || 'Sin tipo'}`;
    }
    return this.tipoSeleccionado.value === 'TRANSITO'
    ? 'Despacho TRANSITO'
    : 'Despacho DM';
  }
  onShow() {
    // Resetear estado inicial
    this.intentoGuardar = false;
    this.resetearErrores();

    // Si hay datos para mostrar (modo edición)
    if (this.vehiculoParaMostrar) {
      console.log('Recibiendo datos para edición:', this.vehiculoParaMostrar);

      // Copiar los datos al modelo del formulario
      this.despacho = {
        tipo: this.vehiculoParaMostrar.tipo || 'DM',
        vin: this.vehiculoParaMostrar.vin || '',
        motorista: this.vehiculoParaMostrar.motorista || '',
        notadelevante: this.vehiculoParaMostrar.notadelevante || '',
        bl: this.vehiculoParaMostrar.bl || '',
        copiaBL: this.vehiculoParaMostrar.copiaBL || '',
        duca: this.vehiculoParaMostrar.duca || '',
        tarja: this.vehiculoParaMostrar.tarja || '',
        observaciones: this.vehiculoParaMostrar.observaciones || ''
      };

      // Establecer el tipo correcto en el select button
      this.tipoSeleccionado = this.tiposDespacho.find(
        t => t.value === (this.despacho.tipo || 'DM')
      ) || this.tiposDespacho[0];

      console.log('Formulario cargado con:', this.despacho);
    } else {
      // Modo creación (formulario vacío)
      this.despacho = {
        tipo: this.tipoSeleccionado.value,
        vin: '',
        motorista: '',
        notadelevante: '',
        bl: '',
        copiaBL: '',
        duca: '',
        tarja: '',
        observaciones: ''
      };
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
      notadelevante: '',
      bl: '',
      copiaBL: '',
      duca: '',
      tarja: '',
      observaciones: ''
    };
  }
  seleccionarVin(event: any) {
    if (!event?.value?.vin) {
      this.despacho.vin = '';
      this.resetearErrores();
      return;
    }

    const vin = event.value.vin;
    const vehiculo = this.vehiculoService.obtenerVehiculoPorVin(vin);

    // Validación reforzada
    if (!vehiculo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'VIN no encontrado en el sistema'
      });
      this.resetearSeleccion();
      return;
    }

    if (vehiculo.despacho && Object.keys(vehiculo.despacho).length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'VIN no disponible',
        detail: 'Este vehículo ya tiene un despacho registrado'
      });
      this.resetearSeleccion();
      return;
    }

    if (vehiculo.estado === 'Deshabilitado' || vehiculo.estado === 'Abandonado') {
      this.messageService.add({
        severity: 'error',
        summary: 'VIN no disponible',
        detail: `Este vehículo está en estado "${vehiculo.estado}" y no puede ser despachado`
      });
      this.resetearSeleccion();
      return;
    }

    // Si pasa todas las validaciones
    this.vinSeleccionado = event.value;
    this.despacho.vin = vin;
    this.despacho.tipo = this.tipoSeleccionado.value;

    // Limpiar campos para nuevo despacho
    this.despacho = {
      vin: vin,
      motorista: '',
      notadelevante: '',
      bl: '',
      copiaBL: '',
      duca: '',
      tarja: '',
      observaciones: ''
    };

    this.cambiarTipoDespacho();
    this.resetearErrores();
  }

  private resetearSeleccion() {
    this.despacho.vin = '';
    this.vinSeleccionado = null;
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
    const datosDespacho = {
      ...this.despacho,
      tipo: this.tipoSeleccionado.value,
      estado: 'Deshabilitado'
    };
    console.log('Datos de despacho a guardar:', datosDespacho);
    this.guardarDespacho.emit(datosDespacho);
    this.visibleChange.emit(false);
  }
validarFormulario(): boolean {
  let valido = true;
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
