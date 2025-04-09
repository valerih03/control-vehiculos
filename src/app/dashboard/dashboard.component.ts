import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VehiculoService } from '../services/vehiculo.service';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router } from '@angular/router';
//import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, FormsModule,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule],
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
  realizararescate: string = '';
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private router: Router
  ) {}
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
  }
  ngOnInit() {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }
  //Confirmación de guardado
  confirmSave() {
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
        this.realizararescate = '';
        this.dialogIngresoVisible  = false;
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada.' });
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
  // Resetear el radio button
  this.realizararescate = '';
  this.dialogIngresoVisible  = false;
  this.vehiculos = this.vehiculoService.obtenerVehiculos();
}
exportarPDF() {
  // Aquí implementas la lógica de exportación, por ejemplo usando jsPDF o alguna librería
  console.log('Exportando a PDF...');
}
}
