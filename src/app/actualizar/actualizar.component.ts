import { Component, OnInit } from '@angular/core';
import { VehiculoService } from '../services/vehiculo.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-actualizar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    RadioButtonModule,
    TableModule,
    DialogModule
  ],
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.css']
})
export class ActualizarComponent implements OnInit {
  vehiculos: any[] = [];
  vehiculoSeleccionado: any = null;
  dialogVisible: boolean = false;
  realizararescate: string = '';

  constructor(
    private vehiculoService: VehiculoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }

  seleccionarVehiculo(vehiculo: any) {
    this.vehiculoSeleccionado = { ...vehiculo };
    this.realizararescate = vehiculo.fechares ? 'Si' : 'No';
    this.dialogVisible = true;
  }

  actualizarVehiculo() {
    this.confirmationService.confirm({
      message: '¿Está seguro de actualizar este vehículo?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.vehiculoService.actualizarVehiculo(this.vehiculoSeleccionado);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Vehículo actualizado correctamente'
        });
        this.dialogVisible = false;
        this.cargarVehiculos();
      }
    });
  }

  cancelarActualizacion() {
    this.dialogVisible = false;
    this.vehiculoSeleccionado = null;
  }
}
