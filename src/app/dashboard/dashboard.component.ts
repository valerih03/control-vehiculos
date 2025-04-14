import { Component, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import {  FormsModule  } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VehiculoService } from '../services/vehiculo.service';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router } from '@angular/router';
import { ValidacionService } from '../services/validacion.service';
import {CheckboxModule} from 'primeng/checkbox';
import {VehiculoformComponent} from '../forms/vehiculoform/vehiculoform.component';
//import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, VehiculoformComponent,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, CheckboxModule, FormsModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
  vehiculoSeleccionado: any;
  vehiculoEditado: any;
  dialogVehiculoVisible = false;
  vehiculos: any[] = [];
  vehiculoActual: any = {};
  modoFormulario: 'crear' | 'editar' = 'crear';

  nuevoVehiculo = {
    consignatario: '',
    nit: '',
    fecha: '',
    vin: '',
    anio: null,
    marca: '',
    estilo: '',
    color: '',
    abandono: '',
    fechares: '',
    despacho: ''
  };

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private validacionService: ValidacionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }

   // Método para abrir el diálogo en modo creación
   showCrearDialog() {
    this.modoFormulario = 'crear';
    this.vehiculoActual = {
      consignatario: '',
      nit: '',
      fecha: '',
      vin: '',
      anio: null,
      marca: '',
      estilo: '',
      color: '',
      abandono: '',
      fechares: '',
      despacho: ''
    };
    this.dialogVehiculoVisible = true;
  }

  // Método para editar: asigna el vehículo seleccionado y cambia el modo
  editarVehiculo(vehiculo: any) {
    this.modoFormulario = 'editar';
    this.vehiculoActual = { ...vehiculo };
    this.dialogVehiculoVisible = true;
  }

  // Maneja el evento del componente de formulario al guardar
  handleGuardar(vehiculo: any) {
    if (this.modoFormulario === 'crear') {
      // Para creación se agrega el vehículo
      this.vehiculoService.agregarVehiculo(vehiculo);
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Vehículo guardado correctamente.' });
    } else {
      // Para edición se actualiza el vehículo
      this.vehiculoService.actualizarVehiculo(vehiculo);
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Vehículo actualizado correctamente.' });
    }
    this.dialogVehiculoVisible = false;
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }

  // Maneja la cancelación: cierra el diálogo
  handleCancelar() {
    this.dialogVehiculoVisible = false;
    this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada.' });
  }


guardarEdicion() {
  if (this.vehiculoEditado) {
    this.vehiculoService.actualizarVehiculo(this.vehiculoEditado);
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Vehículo actualizado correctamente'
    });
    this.dialogEdicionVisible = false;
    this.vehiculos = [...this.vehiculoService.obtenerVehiculos()];
  }
}

exportarPDF() {
  // Aquí implementas la lógica de exportación, por ejemplo usando jsPDF o alguna librería
  console.log('Exportando a PDF...');
}
}
