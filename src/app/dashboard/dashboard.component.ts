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
import { VehiculoformComponent } from '../forms/vehiculoform/vehiculoform.component';
import { Vehiculo } from '../interfaces/vehiculo';
import { Despacho } from '../interfaces/despacho';
import { Rescate } from '../interfaces/rescate';
import { RescateService } from '../services/rescate.service';
import { RescateComponent } from '../rescate/rescate/rescate.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DialogModule, CommonModule, ButtonModule, InputTextModule,
    CalendarModule, DespacharComponent, ToastModule,
    ConfirmDialogModule, TableModule, RadioButtonModule,
    SplitButtonModule, CheckboxModule, FormsModule,
    AutoCompleteModule, VehiculoformComponent, RescateComponent
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
 currentFilters: Partial<Record<keyof Vehiculo, string>> = {};
 isFiltering = false;

 // Formulario vehículo
 vehiculoActual: Partial<Vehiculo> = {};
 modoFormulario: 'crear' | 'editar' = 'crear';
 vehiculoSeleccionado: Vehiculo | null = null;

// rescate
dialogRescateVisible = false;
vehiculosParaRescate: Vehiculo[] = [];
blFiltradoActual = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private despachoService: DespachoService,
    private rescateService: RescateService,
    private validacionService: ValidacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    console.log('Vehículos cargados:', this.vehiculos);
  }


  private cargarDatos(): void {
    this.vehiculoService.actualizarEstadosAbandono(30);

    this.vehiculos = this.vehiculoService.obtenerVehiculos().map(v => {
      if (this.rescateService.obtenerRescatePorBL(v.numeroBL)) {
        v.estado = 'Rescatado';
      }
      else if (this.despachoService.obtenerDespachoPorVin(v.vin)) {
        v.estado = 'Despachado';
      }
      else if (v.estado === 'Abandono') {
      }
      else {
        v.estado = 'Disponible';
      }
      return v;
    });

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
  //PARA DETALLE DESPACHO
  tieneDespacho(vin: string): boolean {
      return !!this.despachoService.obtenerDespachoPorVin(vin);
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
    console.log('Vehículo con despacho:', this.vehiculoConDespacho);

  }
  // Guardar o actualizar despacho vinculado por VIN
  onDespachoGuardado(datos: Despacho): void {
    const despachos = this.despachoService.obtenerDespachos();
    const existente = despachos.find(d => d.vin === datos.vin);

    if (existente) {
      // Editamos un despacho existente
      datos.idDespacho = existente.idDespacho;
      this.despachoService.actualizarDespacho(datos);
      this.messageService.add({
        severity: 'success',
        summary: 'Despacho',
        detail: 'Despacho actualizado.'
      });
    } else {
      // Creamos un despacho nuevo
      this.despachoService.agregarDespacho(datos);
      this.messageService.add({
        severity: 'success',
        summary: 'Despacho',
        detail: 'Despacho registrado.'
      });
      console.log('Nuevo despacho:', datos);
    }

    const veh = this.vehiculoService.obtenerVehiculoPorVin(datos.vin);
    if (veh) {
      veh.estado = 'Despachado';
      this.vehiculoService.actualizarVehiculo(veh);
    }
    this.dialogOpcionesDespachoVisible = false;
    this.cargarDatos();
  }

  // Obtener estado dinámicamente
  getEstadoVehiculo(vehiculo: Vehiculo): string {
    return vehiculo.estado;
  }

  getHighlightedText(text: string | undefined, field: keyof Vehiculo): string {
      if (!text) return 'N/A';
      const term = this.currentFilters[field] ?? '';
      if (!term) return text;
      const regex = new RegExp(term, 'gi');
      return text.replace(regex, match => `<span class="highlight-text">${match}</span>`);
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

  applyHighlight(field: keyof Vehiculo, event: Event): void {
      const value = (event.target as HTMLInputElement)
        .value.trim()
        .toLowerCase();

      if (value) {
        this.currentFilters[field] = value;
      } else {
        delete this.currentFilters[field];
      }

      this.isFiltering = Object.keys(this.currentFilters).length > 0;
      this.updateSortedVehiculos();
  }

  // PARA PDF
  exportarPDF() {
    // Obtener los vehículos filtrados actualmente visibles en la tabla
    const vehiculosFiltrados = this.vehiculos.filter(v => this.shouldDisplayRow(v));

    const vehiculosParaExportar =
      Array.isArray(this.vehiculoSeleccionado) && this.vehiculoSeleccionado.length > 0
        ? this.vehiculoSeleccionado
        : this.selectedVehiculo
          ? [this.selectedVehiculo]
          : vehiculosFiltrados; // Usamos los filtrados en lugar de todos los vehículos

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

          const headers = ['BL','VIN', 'Consignatario', 'NIT', 'Fecha', 'Marca', 'Observaciones', 'Estado'];
          const data = vehiculosParaExportar.map(v => [
            v.bl || 'N/A',
            v.vin || 'N/A',
            v.consignatario || 'N/A',
            v.nit || 'N/A',
            v.fecha ? new Date(v.fecha).toLocaleDateString() : 'N/A',
            v.marca || 'N/A',
            v.observaciones || 'N/A',
            v.estado || 'N/A'
          ]);

          autoTableModule.default(doc, {
            head: [headers],
            body: data,
            startY: 25,
            margin: { horizontal: 10 }, //margen
            tableWidth: 'auto',
            styles: {
              fontSize: 7,
              cellPadding: 1,
              overflow: 'linebreak',
              lineWidth: 0.1,
              halign: 'center'
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
              1: { cellWidth: 28 },
              2: { cellWidth: 35 },
              3: { cellWidth: 27 },
              4: { cellWidth: 15 },
              5: { cellWidth: 20 },
              6: { cellWidth: 20 },
              7: { cellWidth: 20 },
              8: { cellWidth: 20 }
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
    console.log('Vehículos seleccionados para exportar:', vehiculosParaExportar);
    this.clearAllFilters();

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

    // Diálogo vehículo
  showCrearDialog(): void {
    this.modoFormulario = 'crear';
    this.vehiculoActual = {} as Vehiculo;      // Vehículo vacío tipado
    this.dialogVehiculoVisible = true;
    console.log(this.modoFormulario);
  }
  editarVehiculo(vehiculo: Vehiculo): void {
    this.modoFormulario = 'editar';
    this.vehiculoActual = { ...vehiculo };     // Copia el vehículo a editar
    this.dialogVehiculoVisible = true;
    console.log('Vehículo a editar:', this.vehiculoActual);
  }
  handleGuardar(registro: Vehiculo): void {
    // 'registro' ya contiene todas las propiedades de Vehiculo
    if (this.modoFormulario === 'crear') {
      this.vehiculoService.agregarVehiculo(registro);
      this.messageService.add({
        severity: 'success',
        summary: 'Guardado',
        detail: 'Vehículo ingresado correctamente.'
      });
    } else {
      this.vehiculoService.actualizarVehiculo(registro);
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Vehículo actualizado correctamente.'
      });
    }
    this.dialogVehiculoVisible = false;
    this.cargarDatos();  // Recarga la lista con el nuevo/actualizado
  }
  handleCancelar(): void {
    this.dialogVehiculoVisible = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'Operación cancelada.'
    });
  }

  //PARA RESCATE
  habilitarBotonRescate(): boolean {
    if (!this.blFiltradoActual) return false;
    const todos = this.vehiculos.filter(v => v.numeroBL === this.blFiltradoActual);
    return todos.length > 0 && todos.every(v => v.estado === 'Abandono');
  }
  filtrarPorBL(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    this.blFiltradoActual = val;

    // Usamos la clave real de Vehiculo: 'numeroBL'
    if (val) {
      this.currentFilters['numeroBL'] = val.toLowerCase();
    } else {
      delete this.currentFilters['numeroBL'];
    }

    this.isFiltering = Object.keys(this.currentFilters).length > 0;
    this.updateSortedVehiculos();
  }
  verificarRescate(): void {
    const candidatos = this.selectedVehiculos.length > 0
      ? [...this.selectedVehiculos]
      : this.vehiculos.filter(v =>
          this.shouldDisplayRow(v) &&
          v.estado === 'Abandono' &&
          v.numeroBL === this.blFiltradoActual
        );

    if (candidatos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede rescatar',
        detail: 'Selecciona vehículos con mismo BL y estado "Abandono"',
      });
      return;
    }

    this.vehiculosParaRescate = candidatos;
    this.dialogRescateVisible = true;
  }
  procesarRescate(rescate: Rescate): void {
    this.vehiculosParaRescate.forEach(v => {
      v.estado = 'Rescatado';
      this.vehiculoService.actualizarVehiculo(v);
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Rescate exitoso',
      detail: `${this.vehiculosParaRescate.length} vehículo(s) marcados como rescatados.`,
    });

    this.vehiculos = this.vehiculoService.obtenerVehiculos();
    this.updateSortedVehiculos();
    this.dialogRescateVisible = false;
  }

  //PARA FILTRADOS
  getTooltipEstado(vehiculo: Vehiculo): string {
    const hoy = new Date();
    const ingreso = new Date(vehiculo.fechaIngreso);
    const diffMs = hoy.getTime() - ingreso.getTime();
    const diasTranscurridos = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    switch (vehiculo.estado) {
      case 'Despachado': {
        const desp = this.despachoService.obtenerDespachoPorVin(vehiculo.vin);
        const tipo = desp?.tipoSalida ?? 'general';
        return `Despachado como ${this.despachoService.obtenerTipoSalidaPorVin(tipo)}`;
      }
      case 'Abandono': {
        const diasAbandono = Math.max(0, diasTranscurridos - 20);
        return `En abandono desde hace ${diasAbandono} día(s)`;
      }
      case 'Rescatado': {
        // Buscamos el rescate asociado a este BL
        const rescate = this.rescateService.obtenerRescatePorBL(vehiculo.numeroBL);
        if (rescate) {
          const fechaRes = new Date(rescate.fechaRescate);
          return `Fue rescatado el ${fechaRes.toLocaleDateString()}`;
        }
        return 'Rescatado';
      }
      default: {
        // Disponible
        const diasRestantes = Math.max(0, 20 - diasTranscurridos);
        return `Disponible (${diasRestantes} día(s) restantes)`;
      }
    }
  }
  applyFilter(field: keyof Vehiculo, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (value) {
      this.currentFilters[field] = value;
    } else {
      delete this.currentFilters[field];
    }
    this.isFiltering = Object.keys(this.currentFilters).length > 0;
    this.updateSortedVehiculos();
  }
  shouldDisplayRow(veh: Vehiculo): boolean {
    if (!this.isFiltering) return true;

    // Convertimos a [keyof Vehiculo, string][]
    const entries = Object.entries(this.currentFilters) as Array<[keyof Vehiculo, string]>;

    return entries.every(([field, term]) => {
      if (!term.trim()) return true;  // ignorar filtros vacíos
      const value = veh[field];
      return value != null && value.toString().toLowerCase().includes(term);
    });
  }
  updateSortedVehiculos(): void {
    if (!this.isFiltering) {
      this.sortedVehiculos = [...this.vehiculos];
    } else {
      this.sortedVehiculos = [...this.vehiculos].sort((a, b) => {
        const aMatch = this.shouldDisplayRow(a);
        const bMatch = this.shouldDisplayRow(b);
        return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
      });
    }
  }
  filterByEstado(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.currentFilters['estado'] = value;
    this.applyFilter('estado', event);
  }
  filterByBl(event: Event){
    const value = (event.target as HTMLInputElement ).value.toLowerCase();
    this.marcaFilter = value;
    this.applyFilter('numeroBL',event);
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
  search(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredVehiculos = this.vehiculos.filter(vehiculo => {
      const bl = vehiculo.numeroBL ? vehiculo.numeroBL.toLowerCase() : '';
      const vin = vehiculo.vin ? vehiculo.vin.toLowerCase() : '';
      const consignatario = vehiculo.consignatario ? vehiculo.consignatario.toLowerCase() : '';
      const marca = vehiculo.marca ? vehiculo.marca.toLowerCase() : '';
      const estilo = vehiculo.estilo ? vehiculo.estilo.toLowerCase() : '';

      return vin.includes(query) ||
      bl.includes(query) ||
            consignatario.includes(query) ||
            marca.includes(query) ||
            estilo.includes(query);
    });
  }
  isFilteredMatch(vehiculo: Vehiculo): boolean {
    // Convertimos a [keyof Vehiculo, string][]
    const entries = Object.entries(this.currentFilters) as Array<[keyof Vehiculo, string]>;

    // Si no hay filtros activos, no resaltamos nada
    if (entries.length === 0) {
      return false;
    }

    // Para cada filtro no vacío, comprobamos coincidencia
    return entries.every(([field, term]) => {
      term = term.trim().toLowerCase();
      if (!term) {
        // saltar filtros vacíos
        return true;
      }
      const value = vehiculo[field];
      return (
        value != null &&
        value
          .toString()
          .toLowerCase()
          .includes(term)
      );
    });
  }
  clearAllFilters() {
    this.currentFilters = {};
    this.marcaFilter = '';
    this.vinFilter = '';
    this.isFiltering = false;

    this.updateSortedVehiculos();
  }

  //EXPORTAR A EXCEL
  exportarExcel() {
  const vehiculosFiltrados = this.vehiculos.filter(v => this.shouldDisplayRow(v));
  const vehiculosParaExportar =
    Array.isArray(this.selectedVehiculos) && this.selectedVehiculos.length > 0
      ? this.selectedVehiculos
      : this.selectedVehiculo
        ? [this.selectedVehiculo]
        : vehiculosFiltrados;
  if (!vehiculosParaExportar.length) {
    this.messageService.add({ severity:'warn', summary:'Advertencia', detail:'No hay vehículos para exportar' });
    return;
  }

  // 1) Mapear a datos “planos”
  const exportData = vehiculosParaExportar.map(v => ({
    BL:           v.numeroBL,
    VIN:          v.vin,
    Consignatario:v.consignatario,
    NIT:          v.nit,
    FechaIngreso: typeof v.fechaIngreso === 'string'
                     ? v.fechaIngreso
                     : formatDate(v.fechaIngreso as Date, 'yyyy-MM-dd', 'en-US'),
    Marca:        v.marca,
    Observaciones:v.observaciones,
    Estado:       v.estado
  }));

  // 2) Crear worksheet y workbook
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  // (Opcional) Ajustar anchos de columna:
  ws['!cols'] = [
    { wch: 15 }, { wch: 18 }, { wch: 25 },
    { wch: 18 }, { wch: 15 }, { wch: 20 },
    { wch: 30 }, { wch: 12 }
  ];
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vehículos');

  // 3) Escribir como array y descargar con FileSaver
  const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const fileName = `reporte_vehiculos_${new Date().toISOString().slice(0,10)}.xlsx`;
  saveAs(blob, fileName);

  this.messageService.add({ severity:'success', summary:'Éxito', detail:'Excel generado correctamente' });
}

}
