import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { DespachoService } from '../services/despacho.service';  // Import agregado
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { formatDate } from '@angular/common';
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

  @Output() guardarDespacho = new EventEmitter<any>();

  vinSeleccionado: any = null;

  //fechadedespacho
  today: Date = new Date();
  todayISO!: string;

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

  vinFiltrados: any[] = [];
  // Variables para control de errores
  mostrarErrorVin = false;
  mostrarErrorMotorista = false;
  mostrarErrorBl = false;
  mostrarErrorCopiaBl = false;
  mostrarErrorDuca = false;
  mostrarErrorTarja = false;
  mostrarErrorFechaDespacho = false;
  intentoGuardar = false;


  constructor(
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private despachoService: DespachoService   // Servicio agregado
  ) {}

  ngOnInit() {
    if (this.modoVisualizacion && this.vehiculoParaMostrar) {
      this.despacho = { ...this.vehiculoParaMostrar };
      this.tipoSeleccionado = this.vehiculoParaMostrar.bl
        ? this.tiposDespacho[0]
        : this.tiposDespacho[1];
    }
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }


  filtrarVins(event: any) {
    const query = event.query.toLowerCase();

    // Obtener vehículos que no tengan despacho registrado
    const despachos = this.despachoService.obtenerDespachos();
    const vehiculosDisponibles = this.vehiculoService.obtenerVehiculos()
      .filter(v => {
        const tieneDespacho = despachos.some(d => d.vin === v.vin);
        return v.vin && !tieneDespacho && v.estado !== 'Despachado';
      });

    // Filtrar por el query
    this.vinFiltrados = vehiculosDisponibles
      .filter(v => v.vin.toLowerCase().includes(query))
      .map(v => ({
        fechaDespacho: v.fechaDespacho,
        vin: v.vin,
        marca: v.marca || 'Sin marca',
        anio: v.anio ? new Date(v.anio).getFullYear() : 'N/A'
      }));
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

    this.vinsRegistrados = [];

    if (!this.modoVisualizacion) {
      this.despacho = {
        tipo: this.tipoSeleccionado.value,
        fechaDespacho: new Date(),
        vin: '',
        motorista: '',
        notadelevante: '',
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
      fechaDespacho: new Date(),
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
    const vehiculo = this.vehiculoService.obtenerVehiculos()
      .find(v => v.vin === vin);

    if (!vehiculo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'VIN no encontrado'
      });
      return;
    }

    // Verificar despacho existente con el servicio de despacho
    const yaDespachado = this.despachoService.obtenerDespachos().some(d => d.vin === vin);
    if (yaDespachado || vehiculo.estado === 'Despachado') {
      this.messageService.add({
        severity: yaDespachado ? 'warn' : 'warn',
        summary: 'Advertencia',
        detail: yaDespachado
          ? 'Este VIN ya ha sido despachado'
          : 'Este VIN está deshabilitado'
      });
      this.despacho.vin = '';
      this.vinSeleccionado = null;
      return;
    }

    // Resto de la lógica...
    this.despacho.vin = vin;
    this.vinSeleccionado = event.value;

    // Preparar formulario para nuevo despacho
    this.despacho = {
      vin: vin,
      fechaDespacho: new Date(),
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

  private resetearErrores(): void {
    this.mostrarErrorVin = false;
    this.mostrarErrorMotorista = false;
    this.mostrarErrorBl = false;
    this.mostrarErrorCopiaBl = false;
    this.mostrarErrorDuca = false;
    this.mostrarErrorTarja = false;
    this.mostrarErrorFechaDespacho = false;
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
      estado: 'Despachado',
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

      this.mostrarErrorFechaDespacho = !this.despacho.fechaDespacho;
    if (this.mostrarErrorFechaDespacho) valido = false;

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
