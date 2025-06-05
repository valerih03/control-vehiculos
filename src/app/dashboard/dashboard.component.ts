// src/app/dashboard/dashboard.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { VehiculoService } from '../services/vehiculo.service';
import { DespachoService } from '../services/despacho.service';
import { RescateService } from '../services/rescate.service';
import { ValidacionService } from '../services/validacion.service';
import { PdfExportService } from '../services/pdf-export.service';
import { ExcelExportService } from '../services/excel-export.service';

import { DespacharComponent } from '../despachar/despachar.component';
import { VehiculoformComponent } from '../forms/vehiculoform/vehiculoform.component';
import { RescateComponent } from '../rescate/rescate/rescate.component';

import { Vehiculo } from '../interfaces/vehiculo';
import { Despacho } from '../interfaces/despacho';
import { Rescate } from '../interfaces/rescate';
import { ExportColumn } from '../interfaces/export-column';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DespacharComponent,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    RadioButtonModule,
    SplitButtonModule,
    CheckboxModule,
    FormsModule,
    AutoCompleteModule,
    VehiculoformComponent,
    RescateComponent
  ],
  providers: [ConfirmationService, MessageService, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // —— Diálogos visibles ——
  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
  dialogVehiculoVisible = false;
  dialogOpcionesDespachoVisible = false;
  mostrarDetalleDespacho = false;
  dialogRescateVisible = false;

  // —— Datos cargados en memoria ——
  vehiculos: Vehiculo[] = [];
  despachos: Despacho[] = [];
  rescates: Rescate[] = [];

  // —— Arrays para filtrado, selección y exportación ——
  filteredVehiculos: Vehiculo[] = [];
  sortedVehiculos: Vehiculo[] = [];
  selectedVehiculo: Vehiculo | null = null;
  selectedVehiculos: Vehiculo[] = [];
  vehiculosParaRescate: Vehiculo[] = [];
  vehiculosParaExportar: Vehiculo[] = [];

  // —— Estado de los filtros en la tabla ——
  searchQuery = '';
  vinFilter = '';
  marcaFilter = '';
  blFiltradoActual = '';
  currentFilters: Partial<Record<keyof Vehiculo, string>> = {};
  isFiltering = false;

  // —— Datos para el formulario de Vehículo ——
  vehiculoActual: Partial<Vehiculo> = {};
  modoFormulario: 'crear' | 'editar' = 'crear';

  // —— Detalle específico para mostrar ——
  vehiculoConDespacho: Despacho | null = null;
  vehiculoDetalle: Vehiculo | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private despachoService: DespachoService,
    private rescateService: RescateService,
    private validacionService: ValidacionService,
    private excelSvc: ExcelExportService,
    private pdfSvc: PdfExportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    console.log('Datos de la api:', this.vehiculoService.getVehiculos());
  }

  /**
   * Carga simultáneamente Vehículos, Despachos y Rescates desde el backend.
   * Luego calcula el estado de cada vehículo (Disponible, Despachado, Rescatado o Abandono).
   */
  private cargarDatos(): void {
    // Primero, actualizar en el backend los estados de abandono:
    this.vehiculoService.actualizarEstadosAbandono(30).subscribe({
      next: () => {
        // Una vez hecho el PUT /api/vehiculos/actualizar-abandono, traemos todo
        forkJoin({
          vehiculos: this.vehiculoService.getVehiculos(),
          despachos: this.despachoService.getDespachos(),
          rescates: this.rescateService.getRescates()

        }).subscribe({
          next: ({ vehiculos, despachos, rescates }) => {
            // 1) Guardar los arrays en memoria
            this.despachos = despachos;
            this.rescates = rescates;

            // 2) Calcular estado para cada vehículo
            this.vehiculos = vehiculos.map((v: Vehiculo) => {
              // Si existe un rescate con el mismo numeroBL → "Rescatado"
              const existeRescate = this.rescates.find(r => r.numerobl === v.numeroBL);
              if (existeRescate) {
                v.estado = 'Rescatado';
                return v;
              }

              // Si existe un despacho con el mismo VIN → "Despachado"
              const existeDespacho = this.despachos.find(d => d.vin === v.vin);
              if (existeDespacho) {
                v.estado = 'Despachado';
                return v;
              }

              // Si ya venía marcado como "Abandono", lo dejamos así
              if (v.estado === 'Abandono') {
                return v;
              }

              // En caso contrario → "Disponible"
              v.estado = 'Disponible';
              return v;
            });

            // 3) Inicializar filtros y sorted arrays
            this.filteredVehiculos = [...this.vehiculos];
            this.updateSortedVehiculos();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al traer datos combinados:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al actualizar estados de abandono:', err);
      }
    });

  }

  // ——————————— Funciones de filtrado y resaltado en la tabla ———————————

  getSeverity(tipoDespacho: string): string {
    switch (tipoDespacho) {
      case 'DM': return 'info';
      case 'TRANSITO': return 'warning';
      default: return 'info';
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

    // Convertimos a Array de tuplas [campo, término]
    const entries = Object.entries(this.currentFilters) as Array<[keyof Vehiculo, string]>;

    return entries.every(([field, term]) => {
      if (!term.trim()) return true;
      const valor = veh[field];
      return valor != null && valor.toString().toLowerCase().includes(term);
    });
  }

  updateSortedVehiculos(): void {
    if (!this.isFiltering) {
      this.sortedVehiculos = [...this.vehiculos];
    } else {
      // Primero ordenamos por coincidencia de filtros, para mostrar primero los que cumplan todos
      this.sortedVehiculos = [...this.vehiculos].sort((a, b) => {
        const aMatch = this.shouldDisplayRow(a);
        const bMatch = this.shouldDisplayRow(b);
        return aMatch === bMatch ? 0 : (aMatch ? -1 : 1);
      });
    }
  }

  getHighlightedText(text: string | undefined, field: keyof Vehiculo): string {
    if (!text) return 'N/A';
    const term = this.currentFilters[field] ?? '';
    if (!term) return text;
    const regex = new RegExp(term, 'gi');
    return text.replace(regex, match => `<span class="highlight-text">${match}</span>`);
  }

  // ——————————— BUSCADOR y AUTO-COMPLETE de BL en Rescate ———————————

  habilitarBotonRescate(): boolean {
    if (!this.blFiltradoActual) return false;
    // Usamos el array local this.vehiculos
    const todos = this.vehiculos.filter(v => v.numeroBL === this.blFiltradoActual);
    return todos.length > 0 && todos.every(v => v.estado === 'Abandono');
  }

  filtrarPorBL(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    this.blFiltradoActual = val;

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
        detail: 'Selecciona vehículos con mismo BL y estado "Abandono"'
      });
      return;
    }

    this.vehiculosParaRescate = candidatos;
    this.dialogRescateVisible = true;
  }

  procesarRescate(rescate: Rescate): void {
    // 1) Llamada al backend para guardar el rescate
    this.rescateService.agregarRescate(rescate).subscribe({
      next: (creado) => {
        // 2) Marcar localmente cada vehículo como 'Rescatado'
        this.vehiculosParaRescate.forEach(v => {
          v.estado = 'Disponible'; // Cambiamos a 'Disponible' para que no aparezca en abandonos
          this.vehiculoService.actualizarVehiculo(v).subscribe(); // sincronizamos con backend
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Rescate exitoso',
          detail: `${this.vehiculosParaRescate.length} vehículo(s) marcados como rescatados.`
        });

        // 3) Volvemos a recargar todo para actualizar tablas
        this.dialogRescateVisible = false;
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al guardar rescate:', err);
      }
    });
  }

  // ——————————— DETALLE y REGISTRO DE DESPACHO ———————————

  tieneDespacho(vin: string): boolean {
    return this.despachos.some(d => d.vin === vin);
  }

  verDetalleDespacho(v: Vehiculo): void {
    const d = this.despachos.find(d => d.vin === v.vin);
    if (!d) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Despacho',
        detail: 'Este vehículo no tiene despacho registrado.'
      });
      return;
    }
    this.vehiculoConDespacho = d;
    this.vehiculoDetalle = v;
    this.mostrarDetalleDespacho = true;
  }

  onDespachoGuardado(datos: Despacho): void {
    // Verificamos si ya existe un despacho en local
    const existente = this.despachos.find(d => d.vin === datos.vin);

    if (existente) {
      // 1) Actualizar en backend
      datos.idDespacho = existente.idDespacho;
      this.despachoService.actualizarDespacho(datos).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Despacho',
            detail: 'Despacho actualizado.'
          });
          // 2) Actualizamos estado local y guardamos vehículo
          const veh = this.vehiculos.find(v => v.vin === datos.vin);
          if (veh) {
            veh.estado = 'Despachado';
            this.vehiculoService.actualizarVehiculo(veh).subscribe();
          }
          this.dialogOpcionesDespachoVisible = false;
          this.cargarDatos();
        },
        error: (err) => console.error('Error al actualizar despacho:', err)
      });
    } else {
      // 1) Crear nuevo despacho en backend
      this.despachoService.agregarDespacho(datos).subscribe({
        next: (creado) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Despacho',
            detail: 'Despacho registrado.'
          });
          // 2) Actualizamos estado local y guardamos vehículo
          const veh = this.vehiculos.find(v => v.vin === datos.vin);
          if (veh) {
            veh.estado = 'Despachado';
            this.vehiculoService.actualizarVehiculo(veh).subscribe();
          }
          this.dialogOpcionesDespachoVisible = false;
          this.cargarDatos();
        },
        error: (err) => console.error('Error al crear despacho:', err)
      });
    }
  }

  // ——————————— CREAR / EDITAR VEHÍCULO ———————————

  showCrearDialog(): void {
    this.modoFormulario = 'crear';
    this.vehiculoActual = {} as Vehiculo;
    this.dialogVehiculoVisible = true;
  }

  editarVehiculo(vehiculo: Vehiculo): void {
    this.modoFormulario = 'editar';
    this.vehiculoActual = { ...vehiculo };
    this.dialogVehiculoVisible = true;
  }

  handleGuardar(registro: Vehiculo): void {
    if (registro.anio) {
      registro.anio = typeof registro.anio === 'string'
        ? parseInt(registro.anio, 10)
        : registro.anio;
    }

    if (this.modoFormulario === 'crear') {
      this.vehiculoService.agregarVehiculo(registro).subscribe({
        next: (creado) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Vehículo ingresado correctamente.'
          });
          this.dialogVehiculoVisible = false;
          this.cargarDatos();
        },
        error: (err) => console.error('Error al crear vehículo:', err)
      });
    } else {
      this.vehiculoService.actualizarVehiculo(registro).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Vehículo actualizado correctamente.'
          });
          this.dialogVehiculoVisible = false;
          this.cargarDatos();
        },
        error: (err) => console.error('Error al actualizar vehículo:', err)
      });
    }
  }

  handleCancelar(): void {
    this.dialogVehiculoVisible = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'Operación cancelada.'
    });
  }

  // ——————————— TOOLTIP DINÁMICO de Estado ———————————

  getTooltipEstado(vehiculo: Vehiculo): string {
    const hoy = new Date();
    const ingreso = new Date(vehiculo.fechaIngreso as string);
    const diffMs = hoy.getTime() - ingreso.getTime();
    const diasTranscurridos = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    switch (vehiculo.estado) {
      case 'Despachado': {
        const desp = this.despachos.find(d => d.vin === vehiculo.vin);
        const tipo = desp?.tipoSalida ?? 'general';
        return `Despachado como ${tipo}`;
      }
      case 'Abandono': {
        const diasAbandono = Math.max(0, diasTranscurridos - 20);
        return `En abandono desde hace ${diasAbandono} día(s)`;
      }
      case 'Rescatado': {
        const r = this.rescates.find(r => r.numerobl === vehiculo.numeroBL);
        if (r) {
          const fechaRes = new Date(r.fechaRescate as string);
          return `Fue rescatado el ${fechaRes.toLocaleDateString()}`;
        }
        return 'Rescatado';
      }
      default: {
        const diasRestantes = Math.max(0, 20 - diasTranscurridos);
        return `Disponible (${diasRestantes} día(s) restantes)`;
      }
    }
  }

  // ——————————— AUTOCOMPLETE de búsqueda general ———————————

  search(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredVehiculos = this.vehiculos.filter(vehiculo => {
      const bl = vehiculo.numeroBL?.toLowerCase() ?? '';
      const vin = vehiculo.vin?.toLowerCase() ?? '';
      const consignatario = vehiculo.consignatario?.toLowerCase() ?? '';
      const marca = vehiculo.marca?.toLowerCase() ?? '';
      const estilo = vehiculo.estilo?.toLowerCase() ?? '';

      return vin.includes(query) ||
             bl.includes(query) ||
             consignatario.includes(query) ||
             marca.includes(query) ||
             estilo.includes(query);
    });
  }

  isFilteredMatch(vehiculo: Vehiculo): boolean {
    const entries = Object.entries(this.currentFilters) as Array<[keyof Vehiculo, string]>;

    if (entries.length === 0) {
      return false;
    }

    return entries.every(([field, term]) => {
      term = term.trim().toLowerCase();
      if (!term) return true;
      const valor = vehiculo[field];
      return valor != null && valor.toString().toLowerCase().includes(term);
    });
  }

  clearAllFilters() {
    this.currentFilters = {};
    this.marcaFilter = '';
    this.vinFilter = '';
    this.isFiltering = false;
    this.updateSortedVehiculos();
  }

  // ——————————— EXPORTAR PDF / EXCEL ———————————

  private getVehiculosExportar(): Vehiculo[] {
    const visibles = this.vehiculos.filter(v => this.shouldDisplayRow(v));
    if (this.selectedVehiculos.length) return this.selectedVehiculos;
    if (this.selectedVehiculo) return [this.selectedVehiculo];
    return visibles;
  }

  pdfColumns: ExportColumn<Vehiculo>[] = [
    { header: 'BL',            field: 'numeroBL' },
    { header: 'VIN',           field: 'vin' },
    { header: 'Consignatario', field: 'consignatario' },
    { header: 'NIT',           field: 'nit' },
    { header: 'Fecha Ingreso', field: v =>
        typeof v.fechaIngreso === 'string'
          ? v.fechaIngreso
          : formatDate(v.fechaIngreso as Date, 'yyyy-MM-dd', 'en-US')
    },
    { header: 'Marca',         field: 'marca' },
    { header: 'Observaciones', field: 'observaciones' },
    { header: 'Estado',        field: 'estado' }
  ];

  exportarPDF(): void {
    const data = this.getVehiculosExportar();
    if (!data.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay datos para exportar'
      });
      return;
    }
    this.pdfSvc.exportToPDF(data, this.pdfColumns, 'Reporte de Vehículos', 'vehiculos.pdf');
    this.clearAllFilters();
  }

  excelColumns: ExportColumn<Vehiculo>[] = [
    {
      header: 'Fecha Ingreso',
      field: v =>
        typeof v.fechaIngreso === 'string'
          ? v.fechaIngreso
          : formatDate(v.fechaIngreso as Date, 'yyyy-MM-dd', 'en-US'),
      width: 15
    },
    { header: 'BL',            field: 'numeroBL',      width: 15 },
    { header: 'Tarja',         field: 'tarja',   width: 15 },
    { header: 'Consignatario', field: 'consignatario', width: 25 },
    { header: 'NIT',           field: 'nit',           width: 18 },
    {
      header: 'Año',
      field: v => (v.anio ?? '').toString(),
      width: 10
    },
    { header: 'Marca',         field: 'marca',         width: 20 },
    { header: 'Estilo',        field: 'estilo',        width: 20 },
    { header: 'Color',         field: 'color',         width: 15 },
    { header: 'Observaciones', field: 'observaciones', width: 30 },
    { header: 'Estado',        field: 'estado',        width: 12 },
    {
      header: 'Días Transcurridos',
      field: v => {
        const hoy     = Date.now();
        const ingreso = new Date(v.fechaIngreso as string).getTime();
        return Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24)).toString();
      },
      width: 18
    },
    {
      header: 'Fecha Despacho',
      field: v => {
        const d = this.despachos.find(d => d.vin === v.vin);
        if (!d) return '';
        return typeof d.fechaDespacho === 'string'
          ? d.fechaDespacho
          : formatDate(d.fechaDespacho as Date, 'yyyy-MM-dd', 'en-US');
      },
      width: 18
    },
    {
      header: 'Fecha Rescate',
      field: v => {
        const r = this.rescates.find(r => r.numerobl === v.numeroBL);
        if (!r) return '';
        return typeof r.fechaRescate === 'string'
          ? r.fechaRescate
          : formatDate(r.fechaRescate as Date, 'yyyy-MM-dd', 'en-US');
      },
      width: 18
    }
  ];

  exportarExcel(): void {
    const data = this.getVehiculosExportar();
    if (!data.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay datos para exportar'
      });
      return;
    }
    this.excelSvc.exportToExcel(data, this.excelColumns, 'vehiculos.xlsx');
    this.clearAllFilters();
  }
}
