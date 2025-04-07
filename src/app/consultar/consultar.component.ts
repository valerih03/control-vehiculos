import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { VehiculoService } from '../services/vehiculo.service';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [ CommonModule, TableModule, ButtonModule, DialogModule],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css'
})
export class ConsultarComponent {
  vehiculos: any[] = [];

  constructor(private vehiculoService: VehiculoService) {}

  ngOnInit() {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }
}
