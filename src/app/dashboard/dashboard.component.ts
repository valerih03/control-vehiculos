import { DespachoService } from './../services/despacho.service';
import { Component, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
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
import { Router, RouterModule } from '@angular/router';
import { ValidacionService } from '../services/validacion.service';
import { CheckboxModule } from 'primeng/checkbox';
import { DespacharComponent } from '../despachar/despachar.component';
import 'jspdf-autotable';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChangeDetectorRef } from '@angular/core';
import { RegistroComponent } from '../forms/registro/registro.component';
import { Vehiculo } from '../interfaces/vehiculo';
import { Despacho } from '../interfaces/despacho';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DialogModule, CommonModule, ButtonModule, InputTextModule,
    CalendarModule, DespacharComponent, ToastModule,
    ConfirmDialogModule, TableModule, RadioButtonModule,
    SplitButtonModule, CheckboxModule, FormsModule,
    AutoCompleteModule, RegistroComponent
  ],
  providers: [ConfirmationService, MessageService, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
 // Diálogos de consulta y edición
 dialogIngresoVisible = false;
 dialogConsultaVisible = false;
 dialogEdicionVisible = false;
 // Diálogo de registro/edición de vehículo
 dialogVehiculoVisible = false;
 // Diálogo de opciones de despacho
 dialogOpcionesDespachoVisible = false;
 // Detalle de despacho
 mostrarDetalleDespacho = false;
 vehiculoConDespacho: Despacho | null = null;
 vehiculoDetalle: Vehiculo  | null = null;

 // Listas y filtros
 vehiculos: Vehiculo[] = [];
 filteredVehiculos: Vehiculo[] = [];
 sortedVehiculos: Vehiculo[] = [];
 selectedVehiculo: Vehiculo | null = null;
 selectedVehiculos: Vehiculo[] = [];
 vehiculosParaExportar: Vehiculo[] = [];
 searchQuery = '';
 vinFilter = '';
 marcaFilter = '';
 currentFilters: { [key: string]: string } = {};
 isFiltering = false;

 // Formulario vehículo
 vehiculoActual: Partial<Vehiculo> = {};
 modoFormulario: 'crear' | 'editar' = 'crear';
 vehiculoSeleccionado: Vehiculo | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private despachoService: DespachoService,
    private validacionService: ValidacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private tieneDespacho(vin: string): boolean {
    return this.despachoService.obtenerDespachos().some(d => d.vin === vin);
  }

  private cargarDatos(): void {
    this.vehiculos = this.vehiculoService.obtenerVehiculos().map(v => ({
      ...v,
      estado: this.tieneDespacho(v.vin) ? 'Deshabilitado' : 'Disponible'
    }));
    this.filteredVehiculos = [...this.vehiculos];
    this.updateSortedVehiculos();
  }

  getSeverity(tipoDespacho: string): string {
    switch (tipoDespacho) {
      case 'DM': return 'info';
      case 'TRANSITO': return 'warning';
      default: return 'info';
    }
  }

  verDetalleDespacho(v: Vehiculo): void {
    const d = this.despachoService.obtenerDespachoPorVin(v.vin);
    if (!d) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Despacho',
        detail: 'Este vehículo no tiene despacho registrado.'
      });
      return;
    }
    this.vehiculoConDespacho   = d;
    this.vehiculoDetalle = v;
    this.mostrarDetalleDespacho = true;
  }

  // Guardar o actualizar despacho vinculado por VIN
  onDespachoGuardado(datos: any): void {
    const despachos = this.despachoService.obtenerDespachos();
    const existente = despachos.find(d => d.vin === datos.vin);
    if (existente) {
      datos.idDespacho = existente.idDespacho;
      this.despachoService.actualizarDespacho(datos);
      this.messageService.add({ severity: 'success', summary: 'Despacho', detail: 'Despacho actualizado.' });
    } else {
      this.despachoService.agregarDespacho(datos);
      this.messageService.add({ severity: 'success', summary: 'Despacho', detail: 'Despacho registrado.' });
    }
    this.dialogOpcionesDespachoVisible = false;
    this.cargarDatos();
  }

  // Obtener estado dinámicamente
  getEstadoVehiculo(vehiculo: any): string {
    return this.despachoService.obtenerDespachos().some(d => d.vin === vehiculo.vin)
      ? 'Deshabilitado'
      : 'Disponible';
  }

  // Filtrado de autocompletar VINs
  search(event: { query: string }): void {
    const term = event.query.toLowerCase();
    this.filteredVehiculos = this.vehiculos.filter(v =>
      [v.vin, v.consignatario, v.marca, v.estilo]
        .some(f => f?.toLowerCase().includes(term))
    );
  }

  shouldDisplayRow(vehiculo: any): boolean {
    if (!this.isFiltering) return true;
    return this.isFilteredMatch(vehiculo);
  }

  filterByVin(event: Event): void {
    this.vinFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilter('vin', event);
  }

  filterByMarca(event: Event): void {
    this.marcaFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilter('marca', event);
  }

  applyFilter(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (value) this.currentFilters[field] = value;
    else delete this.currentFilters[field];
    this.isFiltering = Object.keys(this.currentFilters).length > 0;
    this.updateSortedVehiculos();
  }

  updateSortedVehiculos(): void {
    if (!this.isFiltering) {
      this.sortedVehiculos = [...this.vehiculos];
      return;
    }
    this.sortedVehiculos = [...this.vehiculos].sort((a, b) => {
      const aMatch = this.matchFilters(a);
      const bMatch = this.matchFilters(b);
      return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
    });
  }

  private matchFilters(item: any): boolean {
    return Object.entries(this.currentFilters).every(([field, val]) =>
      item[field]?.toString().toLowerCase().includes(val)
    );
  }

  getHighlightedText(text: string | null | undefined, field: string): string {
    if (!text) return 'N/A';
    let result = text.toString();
    const term = this.currentFilters[field];
    if (term) {
      const regex = new RegExp(term, 'gi');
      result = result.replace(regex, match => `<span class="highlight-text">${match}</span>`);
    }
    return result;
  }

  onVehiculoSelect(event: any): void {
    this.selectedVehiculo = event;
  }

  clearSearch(): void {
    this.selectedVehiculo = null;
    this.searchQuery = '';
    this.currentFilters = {};
    this.updateSortedVehiculos();
  }

  applyHighlight(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (value) this.currentFilters[field] = value;
    else delete this.currentFilters[field];
    this.isFiltering = Object.keys(this.currentFilters).length > 0;
    this.updateSortedVehiculos();
  }

  isFilteredMatch(vehiculo: any): boolean {
    if (!this.isFiltering) return true;
    return Object.entries(this.currentFilters).every(([field, val]) =>
      vehiculo[field]?.toString().toLowerCase().includes(val)
    );
  }

  exportarPDF(): void {
    const vehiculosParaExportar =
      Array.isArray(this.selectedVehiculos) && this.selectedVehiculos.length > 0
        ? this.selectedVehiculos
        : this.selectedVehiculo
          ? [this.selectedVehiculo]
          : this.vehiculos;
    if (!vehiculosParaExportar || vehiculosParaExportar.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No hay vehículos para exportar' });
      return;
    }
    try {
      import('jspdf').then(jsPDFModule => {
        import('jspdf-autotable').then(autoTableModule => {
          const { jsPDF } = jsPDFModule;
          const doc = new jsPDF('p', 'mm', 'a4');
          const fecha = new Date().toLocaleString();
          doc.setFontSize(14);
          doc.text('REPORTE DE VEHÍCULOS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
          doc.setFontSize(8);
          doc.text(`Generado: ${fecha}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
          const headers = ['VIN', 'Consignatario', 'NIT', 'Fecha', 'Marca', 'Estilo'];
          const data = vehiculosParaExportar.map(v => [
            v.vin || 'N/A',
            v.consignatario || 'N/A',
            v.nit || 'N/A',
            v.fechaIngreso ? new Date(v.fechaIngreso).toLocaleDateString() : 'N/A',
            v.marca || 'N/A',
            v.estilo || 'N/A'
          ]);
          autoTableModule.default(doc, {
            head: [headers], body: data, startY: 25,
            margin: { horizontal: 35 }, tableWidth: 'auto',
            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', lineWidth: 0.1, halign: 'center' },
            headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 25 }, 2: { cellWidth: 27 }, 3: { cellWidth: 16 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 } }
          });
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(6);
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 5);
          }
          const fileName = `reporte_vehiculos_${new Date().toISOString().slice(0, 10)}.pdf`;
          doc.save(fileName);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'PDF generado correctamente' });
        }).catch(error => this.handlePdfError(error));
      }).catch(error => this.handlePdfError(error));
    } catch (error) {
      this.handlePdfError(error as Error);
    }
  }

  private handlePdfError(error: Error): void {
    console.error('Error al generar PDF:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo generar PDF: ${error.message}` });
  }

  // Diálogo vehículo
  showCrearDialog(): void {
    this.modoFormulario = 'crear';
    this.vehiculoActual = {};
    this.dialogVehiculoVisible = true;
  }

  editarVehiculo(vehiculo: any): void {
    this.modoFormulario = 'editar';
    this.vehiculoActual = { ...vehiculo };
    this.dialogVehiculoVisible = true;
  }

  handleGuardar(registro: any): void {
    const { fechaIngreso, numeroBL, numeroTarja, vehiculo } = registro;
    if (this.modoFormulario === 'crear') {
      this.vehiculoService.agregarVehiculo({
        ...vehiculo,
        fechaIngreso,
        bl: numeroBL,
        tarja: numeroTarja
      });
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Vehículo ingresado correctamente.' });
    } else {
      this.vehiculoService.actualizarVehiculo({
        ...vehiculo,
        fechaIngreso,
        bl: numeroBL,
        tarja: numeroTarja
      });
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Vehículo actualizado correctamente.' });
    }
    this.dialogVehiculoVisible = false;
    this.cargarDatos();
  }

  handleCancelar(): void {
    this.dialogVehiculoVisible = false;
    this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada.' });
  }
}
