import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { VehiculoService } from '../services/vehiculo.service';
import { Vehiculo } from '../interfaces/vehiculo';

@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css'
})
export class ConsultarComponent implements OnInit {
  // Diálogos
  dialogIngresoVisible = false;
  dialogEdicionVisible = false;

  // Listado de vehículos
  vehiculos: Vehiculo[] = [];
  vehiculoSeleccionado: Vehiculo | null = null;
  vehiculoEditado: Vehiculo | null = null;

  // Formulario de creación
  nuevoVehiculo: Partial<Vehiculo> = {};

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehiculos();
  }

  private loadVehiculos(): void {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }

  // Apertura de diálogo de edición
  editarVehiculo(vehiculo: Vehiculo): void {
    this.vehiculoEditado = { ...vehiculo };
    this.dialogEdicionVisible = true;
  }

  guardarEdicion(): void {
    if (this.vehiculoEditado) {
      this.vehiculoService.actualizarVehiculo(this.vehiculoEditado);
      this.messageService.add({
        severity: 'success', summary: 'Actualizado', detail: 'Vehículo actualizado correctamente'
      });
      this.dialogEdicionVisible = false;
      this.loadVehiculos();
    }
  }

  // Confirmación de guardado de nuevo vehículo
  confirmSave(): void {
    this.confirmationService.confirm({
      message: '¿Desea guardar los datos?', header: 'Confirmación', icon: 'pi pi-question-circle',
      acceptLabel: 'Sí', rejectLabel: 'No',
      accept: () => this.guardarDatos(),
      reject: () => this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Guardado cancelado.' })
    });
  }

  // Confirmación de cancelación de formulario
  confirmCancel(): void {
    this.confirmationService.confirm({
      message: '¿Desea cancelar?', header: 'Confirmación', icon: 'pi pi-question-circle',
      acceptLabel: 'Sí', rejectLabel: 'No',
      accept: () => this.cancelForm(),
      reject: () => this.messageService.add({ severity: 'info', summary: 'Continuar', detail: 'Operación continuada.' })
    });
  }

  // Guardar nuevo vehículo
  private guardarDatos(): void {
    if (this.nuevoVehiculo as Vehiculo) {
      this.vehiculoService.agregarVehiculo(this.nuevoVehiculo as Vehiculo);
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Vehículo ingresado correctamente.' });
      this.dialogIngresoVisible = false;
      this.resetNuevo();
      this.loadVehiculos();
    }
  }

  // Reiniciar formulario de creación
  private cancelForm(): void {
    this.dialogIngresoVisible = false;
    this.resetNuevo();
    this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada.' });
  }

  private resetNuevo(): void {
    this.nuevoVehiculo = {};
  }
}
