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
import { Router, RouterModule } from '@angular/router';
import { ValidacionService } from '../services/validacion.service';
import {CheckboxModule} from 'primeng/checkbox';
import {VehiculoformComponent} from '../forms/vehiculoform/vehiculoform.component';
import { DespacharComponent } from '../despachar/despachar.component';
import 'jspdf-autotable';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, VehiculoformComponent, DespacharComponent,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, CheckboxModule, FormsModule, AutoCompleteModule],
  providers: [ConfirmationService, MessageService, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  //consultar
  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
  //filrtrar
  filteredVehiculos: any[] = [];
  selectedVehiculo: any = null;
  selectedVehiculos: any[] = [];
  vehiculosParaExportar: any[] = [];
  searchQuery: string = '';
  vinFilter: string = '';
  marcaFilter: string = '';
  currentFilters: { [key: string]: string } = {};
  sortedVehiculos: any[] = [];
  isFiltering: boolean = false;
  //despachar
  dialogOpcionesDespachoVisible = false;
  mostrarDM = false;
  mostrarTransito = false;
  //vehiculo
  vehiculos: any[] = [];
  vehiculoSeleccionado: any;
  vehiculoEditado: any;
  dialogVehiculoVisible = false;
  vehiculoActual: any = {};
  modoFormulario: 'crear' | 'editar' = 'crear';
  //detalle de despechos
  mostrarDetalleDespacho = false;
  vehiculoConDespacho: any = null;


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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
    this.filteredVehiculos = [...this.vehiculos];
    this.updateSortedVehiculos();
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
  //filtrar datos
  search(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredVehiculos = this.vehiculos.filter(vehiculo => {
      const vin = vehiculo.vin ? vehiculo.vin.toLowerCase() : '';
      const consignatario = vehiculo.consignatario ? vehiculo.consignatario.toLowerCase() : '';
      const marca = vehiculo.marca ? vehiculo.marca.toLowerCase() : '';
      const estilo = vehiculo.estilo ? vehiculo.estilo.toLowerCase() : '';

      return vin.includes(query) ||
             consignatario.includes(query) ||
             marca.includes(query) ||
             estilo.includes(query);
    });
  }
  shouldDisplayRow(vehiculo: any): boolean {
    // Si no estamos filtrando, mostrar todas las filas
    if (!this.isFiltering) return true;
    return this.isFilteredMatch(vehiculo);
  }
  filterByVin(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.vinFilter = value;
    this.applyFilter('vin', event);
  }
  filterByMarca(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.marcaFilter = value;
    this.applyFilter('marca', event);
  }
  applyFilter(field: string, event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    // Actualizar estado de filtrado
    this.isFiltering = value.length > 0 || Object.keys(this.currentFilters).length > 0;
    if (value) {
      this.currentFilters[field] = value;
    } else {
      delete this.currentFilters[field];
      this.isFiltering = Object.keys(this.currentFilters).length > 0;
    }
    this.updateSortedVehiculos();
  }
  updateSortedVehiculos() {
    if (Object.keys(this.currentFilters).length === 0) {
      this.sortedVehiculos = [...this.vehiculos];
      this.isFiltering = false;
      return;
    }
    // Ordenar poniendo primero los que coinciden
    this.sortedVehiculos = [...this.vehiculos].sort((a, b) => {
      const aMatches = this.isFilteredMatch(a);
      const bMatches = this.isFilteredMatch(b);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
    this.isFiltering = true;
  }
  checkMatches(vehiculo: any): boolean {
    return Object.entries(this.currentFilters).every(([field, searchTerm]) => {
      const fieldValue = vehiculo[field]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchTerm);
    });
  }
  getHighlightedText(text: string | null | undefined, field: string): string {
    if (!text) return 'N/A';
    let result = text.toString();
    // Solo resaltar si hay filtros activos
    if (this.currentFilters[field] && this.currentFilters[field].trim() !== '') {
      const term = this.currentFilters[field];
      const regex = new RegExp(term, 'gi');
      result = result.replace(regex, match => `<span class="highlight-text">${match}</span>`);
    }
    return result;
  }
  onVehiculoSelect(event: any) {
    this.vehiculoSeleccionado = event;
  }
  clearSearch() {
    this.selectedVehiculo = null;
    this.searchQuery = '';
    this.currentFilters = {};
    this.updateSortedVehiculos();
    this.vehiculoSeleccionado = null;
  }
  //nuevos metodos para filtrar
  applyHighlight(field: string, event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (value) {
      this.currentFilters[field] = value;
    } else {
      this.currentFilters[field] = '';
    }
  }
  isFilteredMatch(vehiculo: any): boolean {
    if (Object.keys(this.currentFilters).length === 0) {
      return false;
    }
    // Verificar si el vehículo coincide con TODOS los filtros activos
    return Object.entries(this.currentFilters).every(([field, searchTerm]) => {
      // Solo considerar filtros que no estén vacíos
      if (searchTerm.trim() === '') return true;

      const fieldValue = vehiculo[field]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchTerm.toLowerCase());
    });
  }
  exportarPDF() {
    const vehiculosParaExportar =
  Array.isArray(this.vehiculoSeleccionado) && this.vehiculoSeleccionado.length > 0
    ? this.vehiculoSeleccionado
    : this.selectedVehiculo
      ? [this.selectedVehiculo]
      : this.vehiculos;
    if (!vehiculosParaExportar || vehiculosParaExportar.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay vehículos para exportar'
      });
      return;
    }
    try {
      import('jspdf').then((jsPDFModule) => {
        import('jspdf-autotable').then((autoTableModule) => {
          const { jsPDF } = jsPDFModule;
          const doc = new jsPDF('p', 'mm', 'a4');

          const fecha = new Date().toLocaleString();
          const titulo = 'REPORTE DE VEHÍCULOS';
          const pageWidth = doc.internal.pageSize.getWidth();
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(titulo, pageWidth / 2, 15, { align: 'center' });
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generado: ${fecha}`, pageWidth / 2, 20, { align: 'center' });
          const headers = ['VIN', 'Consignatario', 'NIT', 'Fecha', 'Marca', 'Estilo', 'Abandono', 'Fecha Rescate', 'Despacho'];
          const data = vehiculosParaExportar.map(v => [
            v.vin || 'N/A',
            v.consignatario || 'N/A',
            v.nit || 'N/A',
            v.fecha ? new Date(v.fecha).toLocaleDateString() : 'N/A',
            v.marca || 'N/A',
            v.estilo || 'N/A',
            v.abandono || 'N/A',
            v.fechares || 'N/A',
            v.despacho || 'N/A'
          ]);
          autoTableModule.default(doc, {
            head: [headers],
            body: data,
            startY: 25,
            margin: { horizontal: 10 },
            tableWidth: 'auto',
            styles: {
              fontSize: 7,
              cellPadding: 2,
              overflow: 'linebreak',
              lineWidth: 0.1
            },
            headStyles: {
              fillColor: [13, 71, 161],
              textColor: 255,
              fontStyle: 'bold',
              halign: 'center',
              fontSize: 7
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240]
            },
            columnStyles: {
              0: { cellWidth: 28 },
              1: { cellWidth: 25 },
              2: { cellWidth: 20 },
              3: { cellWidth: 20 },
              4: { cellWidth: 20 },
              5: { cellWidth: 20 },
              6: { cellWidth: 18 },
              7: { cellWidth: 20 },
              8: { cellWidth: 18 }
            }
          });
          const pageCount = doc.getNumberOfPages();
          for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(6);
            doc.text(
              `Página ${i} de ${pageCount}`,
              pageWidth - 15,
              doc.internal.pageSize.getHeight() - 5
            );
          }
         const fileName = `reporte_vehiculos_${new Date().toISOString().slice(0, 10)}.pdf`;
          doc.save(fileName);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'PDF generado correctamente'
          });
        }).catch((error: Error) => {
          this.handlePdfError(error);
        });
      }).catch((error: Error) => {
        this.handlePdfError(error);
      });
    } catch (error: unknown) {
      this.handlePdfError(error instanceof Error ? error : new Error(String(error)));
    }
}
verDetalleDespacho(vehiculo: any) {
  // Verifica que el vehículo tenga datos de despacho
  if (!vehiculo.bl && !vehiculo.copiaBL) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Sin datos',
      detail: 'Este vehículo no tiene despacho registrado'
    });
    return;
  }

  this.vehiculoConDespacho = { ...vehiculo };
  console.log("Datos a mostrar:", this.vehiculoConDespacho); // Verifica en consola
  this.mostrarDetalleDespacho = true;
}
//mesaje de error
private handlePdfError(error: Error) {
  console.error('Error al generar PDF:', error);
  const errorMessage = error.message || 'Error desconocido al generar PDF';
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: `No se pudo generar el PDF: ${errorMessage}`
  });

}
}
