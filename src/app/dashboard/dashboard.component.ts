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
//import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, CheckboxModule, FormsModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
  vehiculos: any[] = [];
  vehiculoSeleccionado: any;
  vehiculoEditado: any;

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
  anio!: number;
  realizarRescate: boolean = false; //para el checkbox
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private validacionService: ValidacionService,
    private router: Router
  ) {}

//METODOS PARA VALIDACIONES
//metodo para menejar cambios en el checkbox
onRescateChange(){
  if(!this.realizarRescate){
    this.nuevoVehiculo.fechares=''; // Limpiar el campo de fecha de rescate si el checkbox no está seleccionado
  }
}

private resetForm() {
  this.nuevoVehiculo = {
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
  this.realizarRescate = false; // Reiniciar el checkbox al cancelar
  this.dialogIngresoVisible = false;
}


// Primera declaración (correcta)
editarVehiculo(vehiculo: any) {
  this.vehiculoEditado = { ...vehiculo };
  this.dialogEdicionVisible = true;
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
showDialog() {
  this.dialogIngresoVisible  = true;
  this.realizarRescate = false; // Reiniciar el checkbox al abrir el diálogo
  this.nuevoVehiculo.fechares = ''; // Reiniciar el campo de fecha de rescate al abrir el diálogo
}

ngOnInit() {
  this.vehiculos = this.vehiculoService.obtenerVehiculos();
}

//Confirmación de guardado + VALIDACIONES
confirmSave() {
   // Validar antes de mostrar confirmación
   const validacion = this.validacionService.validarVehiculo({
    ...this.nuevoVehiculo,
    realizarRescate: this.realizarRescate
  });

  if (!validacion.isValid) {
    validacion.errors.forEach(error => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error
      });
    });
    return;
  }

  this.confirmationService.confirm({
    message: '¿Desea guardar los datos?',
    header: 'Confirmación',
    icon: 'pi pi-question-circle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    accept: () => {
      this.guardarDatos();
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Datos guardados correctamente.' });
    },
    reject: () => {
      this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Guardado cancelado.' });
    }
  });
}
  //Confirmación de cancelación
  confirmCancel() {
    this.confirmationService.confirm({
      message: '¿Desea cancelar?',
      header: 'Confirmación',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        // Limpiar el formulario al cancelar
        this.resetForm();
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Operación cancelada.'
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Continuar', detail: 'Operación continuada.' });
      }
    });
  }
 //Guardar datos
guardarDatos() {
  this.vehiculoService.agregarVehiculo({ ...this.nuevoVehiculo });
  // Limpiar el formulario
  this.resetForm();
  this.vehiculos = this.vehiculoService.obtenerVehiculos();
}
exportarPDF() {
  // Aquí implementas la lógica de exportación, por ejemplo usando jsPDF o alguna librería
  console.log('Exportando a PDF...');
}
}
