import { Component, OnInit } from '@angular/core';
import { VehiculoService } from '../services/vehiculo.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-actualizar',
  standalone: true,
  imports: [TableModule, CalendarModule, FormsModule, CommonModule, ButtonModule, InputTextModule],
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.css']
})
export class ActualizarComponent implements OnInit {
  vehiculos: any[] = [];
  clonedVehicles: { [s: string]: any } = {}; //copia temporal del vehículo antes de editarlo (por si se cancela la edición)

  constructor(
    private vehiculoService: VehiculoService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarVehiculos();
  }
  cargarVehiculos() { //obtiene los vehículos del servicio
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }

  onRowEditInit(vehiculo: any) { //guarda una copia del vehículo antes de editarlo
    this.clonedVehicles[vehiculo.vin] = {...vehiculo};
  }
  onRowEditSave(vehiculo: any) { //guarda los cambios
    if (!vehiculo.consignatario || !vehiculo.vin) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Consignatario y VIN son requeridos'
      });
      return;
    }
    const actualizado = this.vehiculoService.actualizarVehiculo(vehiculo);
    if (actualizado) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Vehículo actualizado correctamente'
      });
      delete this.clonedVehicles[vehiculo.vin];
    }
  }
  onRowEditCancel(vehiculo: any, index: number) { //cancela la edición
    const original = this.clonedVehicles[vehiculo.vin];
    if (original) {
      this.vehiculos[index] = {...original};
      delete this.clonedVehicles[vehiculo.vin];
    }
  }
}
