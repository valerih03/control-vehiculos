import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { VehiculoService } from '../services/vehiculo.service';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [ CommonModule, TableModule, ButtonModule, DialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css'
})
export class ConsultarComponent {
  //consultar
    dialogIngresoVisible = false;
    dialogConsultaVisible = false;
    dialogEdicionVisible = false;
    //vehiculo
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
    };
    anio!: number;
    realizararescate: string = '';
    constructor( private confirmationService: ConfirmationService, private messageService: MessageService,
      private vehiculoService: VehiculoService, private router: Router
    ) {}
    dialogOpcionesDespachoVisible = false;
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
        // Limpiar el formulario
        this.nuevoVehiculo = {
          consignatario: '',
          nit: '',
          fecha: '',
          vin: '',
          anio: null,
          marca: '',
          estilo: '',
          color: ''
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
    color: ''
  };
  this.realizararescate = '';
  this.dialogIngresoVisible  = false;
  this.vehiculos = this.vehiculoService.obtenerVehiculos();
}
exportarPDF() {
  console.log('Exportando a PDF...');
}

}
