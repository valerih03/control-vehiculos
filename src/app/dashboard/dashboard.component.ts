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
import { DespacharComponent } from '../despachar/despachar.component';
import 'jspdf-autotable';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChangeDetectorRef } from '@angular/core';
import { VehiculoformComponent } from "../forms/vehiculoform/vehiculoform.component";
import { RescateComponent } from '../rescate/rescate.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, DespacharComponent,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, CheckboxModule,
    FormsModule, AutoCompleteModule, VehiculoformComponent, RescateComponent],
  providers: [ConfirmationService, MessageService, /* RouterModule, */  VehiculoService,
    ValidacionService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  //consultar
  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
  //filtrar
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
  visibleRescate: boolean = false;

  vehiculoEditandoDespacho: any = null;
  despachoactual: any = null;

  nuevoVehiculo = {
    numeroTarja: '',
    fechaIngreso: '',
    numeroBL: '',
    consignatario: '',
    vin: '',
    anio: null,
    marca: '',
    nit: '',
    estado: ''
  };
  despacho: any = {
    tipo: '',
    vin: '',
    motorista: '',
    notadelevante: '',
    bl: '',
    copiaBL: '',
    duca: '',
    tarja: '',
    observaciones: ''
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
  getSeverity(tipoDespacho: string): string {
    switch(tipoDespacho) {
      case 'DM': return 'info';
      case 'TRANSITO': return 'warning';
      default: return 'info';
    }
  }
  mostrarDialogoRescate() {
    this.visibleRescate = true;
  }
seleccionarParaRescate(vehiculo: any): void {
  this.vehiculoSeleccionado = vehiculo;
  //this.mostrarDialogoRescate = true;
}
procesarRescate(datosRescate: any): void {
  console.log('Datos del rescate:', datosRescate);
}
  //PARA EL DETALLES DE DESPACHO
  verDetalleDespacho(vehiculo: any) {
    // Pasamos el vehículo completo que ya contiene los datos de despacho
    this.vehiculoConDespacho = vehiculo;
    this.mostrarDetalleDespacho = true;
    console.log('Detalle de despacho:', this.vehiculoConDespacho.despacho);
}
onDespachoGuardado(datos: any) {
  const ok = this.vehiculoService.actualizarDespacho(datos);
  if (ok) {
    this.messageService.add({
      severity: 'success',
      summary: 'Despacho',
      detail: 'Detalle de despacho actualizado correctamente.'
    });

    // Actualizar la lista de vehículos
    this.vehiculos = this.vehiculoService.obtenerVehiculos();

    // Si estamos viendo el detalle de este vehículo, actualizarlo también
    if (this.vehiculoConDespacho?.vin === datos.vin) {
      this.vehiculoConDespacho.despacho = {
        tipo: datos.tipo,
        motorista: datos.motorista,
        bl: datos.bl,
        copiaBL: datos.copiaBL,
        duca: datos.duca,
        tarja: datos.tarja,
        observaciones: datos.observaciones
      };
    }

    this.dialogOpcionesDespachoVisible = false;
  }
}//Metodo para mostrar el ESTADO de un vehiculo
    getEstadoVehiculo(vehiculo: any): string {
    if (vehiculo.despacho) return 'Deshabilitado';
    if (vehiculo.diasTranscurridos > 20) return 'Abandono';
    return `Disponible (${20 - vehiculo.diasTranscurridos}d restantes)`;
}
getTooltipEstado(vehiculo: any): string {
  if (vehiculo.estado === 'Deshabilitado') {
    return `Despachado como ${vehiculo.despacho?.tipo || 'despacho general'}`;
  } else if (vehiculo.estado === 'Abandono') {
    return `Vehículo en abandono desde hace ${vehiculo.diasTranscurridos - 20} días`;
  } else {
    return `Disponible (${20 - (vehiculo.diasTranscurridos || 0)} días restantes)`;
  }
}
  iniciarRescate(vehiculo: any) {
  // Lógica para iniciar rescate
  if (this.vehiculoService.iniciarRescate(vehiculo.vin)) {
    this.messageService.add({
      severity: 'success',
      summary: 'Rescate',
      detail: 'Proceso de rescate iniciado para VIN: ' + vehiculo.vin
    });
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }
}
  obtenerVehiculos(): any[] {
    return this.vehiculos.map(v => ({
      ...v,
      estado: v.despacho ? 'Deshabilitado' : 'Disponible'
    }));
  }
  actualizarDespacho(datos: any): boolean {
    const vehiculo = this.vehiculos.find(v => v.vin === datos.vin);
    if (vehiculo) {
      vehiculo.despacho = datos.tipo; // 'DM' o 'TRANSITO'
      vehiculo.motorista = datos.motorista;
      vehiculo.bl = datos.bl;
      vehiculo.copiaBL = datos.copiaBL;
      vehiculo.duca = datos.duca;
      vehiculo.tarja = datos.tarja;
      vehiculo.observaciones = datos.observaciones;
      vehiculo.estado = 'Deshabilitado';
      return true;
    }
    return false;
  }
   // Método para abrir el diálogo en modo creación
   showCrearDialog() {
    this.modoFormulario = 'crear';
    this.vehiculoActual = {};
    this.dialogVehiculoVisible = true;
  }
  // Método para editar: asigna el vehículo seleccionado y cambia el modo
  editarVehiculo(vehiculo: any) {
    this.modoFormulario = 'editar';
    this.vehiculoActual = {
      ...vehiculo,
      numeroBL: vehiculo.numeroBL || vehiculo.bl,
      numeroTarja: vehiculo.numeroTarja || vehiculo.tarja,
      fechaIngreso: vehiculo.fechaIngreso || vehiculo.fecha
    };
    console.log('Vehículo a editar:', this.vehiculoActual);
    this.dialogVehiculoVisible = true;
  }
  editarDespachoDesdeDetalle(vehiculo: any) {
    // Prepara los datos del despacho asegurando todas las propiedades necesarias
    this.despachoactual = {
      tipo: vehiculo.despacho?.tipo || 'DM',
      vin: vehiculo.vin,
      motorista: vehiculo.despacho?.motorista || '',
      notadelevante: vehiculo.despacho?.notadelevante || '',
      bl: vehiculo.despacho?.bl || '',
      copiaBL: vehiculo.despacho?.copiaBL || '',
      duca: vehiculo.despacho?.duca || '',
      tarja: vehiculo.despacho?.tarja || '',
      observaciones: vehiculo.despacho?.observaciones || ''
    };

    console.log('Datos preparados para edición:', this.despachoactual);

    // Forzar detección de cambios
    this.cdr.detectChanges();

    // Abrir diálogo después de preparar los datos
    setTimeout(() => {
      this.dialogOpcionesDespachoVisible = true;
    });
  }
  // Maneja el evento del componente de formulario al guardar
  handleGuardar(vehiculo: any) {
    // Normaliza los datos antes de guardar
    const vehiculoParaGuardar = {
      ...vehiculo,
      bl: vehiculo.numeroBL,
      tarja: vehiculo.numeroTarja,
      fecha: vehiculo.fechaIngreso
    };

    if (this.modoFormulario === 'crear') {
      this.vehiculoService.agregarVehiculo(vehiculoParaGuardar);
      this.messageService.add({
        severity: 'success',
        summary: 'Guardado',
        detail: 'Vehículo ingresado correctamente.'
      });
    } else {
      this.vehiculoService.actualizarVehiculo(vehiculoParaGuardar);
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Vehículo actualizado correctamente.'
      });
    }
    console.log('Vehículo guardado:', vehiculoParaGuardar);
    this.dialogVehiculoVisible = false;
    this.vehiculos = this.vehiculoService.obtenerVehiculos();
  }
  onDialogShow() {
    console.log('Diálogo mostrado, datos actuales:', this.despachoactual);
    this.cdr.detectChanges();
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
      const bl = vehiculo.bl ? vehiculo.bl.toLowerCase() : '';
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
  shouldDisplayRow(vehiculo: any): boolean {
    // Si no estamos filtrando, mostrar todas las filas
    if (!this.isFiltering) return true;
    return this.isFilteredMatch(vehiculo);
  }
  filterByBl(event: Event){
    const value = (event.target as HTMLInputElement ).value.toLowerCase();
    this.marcaFilter = value;
    this.applyFilter('bl',event);
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
    // Ordenar el filtrado poniendo primero los que coinciden
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

        const headers = ['BL','VIN', 'Consignatario', 'NIT', 'Fecha', 'Marca', 'Estado'];
        const data = vehiculosParaExportar.map(v => [
          v.bl || 'N/A',
          v.vin || 'N/A',
          v.consignatario || 'N/A',
          v.nit || 'N/A',
          v.fecha ? new Date(v.fecha).toLocaleDateString() : 'N/A',
          v.marca || 'N/A',
          v.estado || 'N/A'
        ]);

        autoTableModule.default(doc, {
          head: [headers],
          body: data,
          startY: 25,
          margin: { horizontal: 20 }, //margen
          tableWidth: 'auto',
          styles: {
            fontSize: 7,
            cellPadding: 2,
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
            7: { cellWidth: 20 }
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
