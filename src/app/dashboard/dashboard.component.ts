import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule} from '@angular/common';
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
import { DespacharComponent } from '../despachar/despachar.component';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, FormsModule,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, DespacharComponent,
    AutoCompleteModule],
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
  //despachar
  dialogOpcionesDespachoVisible = false;
  mostrarDM = false;
  mostrarTransito = false;
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
    abandono: '',
    fechares: '',
    despacho: ''
  };
  anio!: number;
  realizararescate: string = '';
  constructor( private confirmationService: ConfirmationService, private messageService: MessageService,
    private vehiculoService: VehiculoService, private router: Router
  ) {}
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
    this.dialogIngresoVisible  = true,
    this.mostrarDM = false;
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
        // Limpiar el formulario al cancelar
        this.nuevoVehiculo = {
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
  // Validación básica
  if (!this.nuevoVehiculo.vin || !this.nuevoVehiculo.consignatario) {
    console.error('Error: VIN y Consignatario son campos requeridos');
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'VIN y Consignatario son requeridos'
    });
    return;
  }
  console.group('Guardando datos del vehículo');
  console.log('Datos a guardar:', JSON.parse(JSON.stringify(this.nuevoVehiculo)));
  try {
    this.vehiculoService.agregarVehiculo({ ...this.nuevoVehiculo });
    console.log('Vehículo guardado exitosamente');
    // Mostrar lista actualizada
    const vehiculosActualizados = this.vehiculoService.obtenerVehiculos();
    console.table(vehiculosActualizados);
    // Limpiar formulario
    this.nuevoVehiculo = {
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
    this.realizararescate = '';
    this.dialogIngresoVisible = false;
    this.vehiculos = vehiculosActualizados;

    console.log('Formulario reseteado correctamente');
  } catch (error) {
    console.error('Error al guardar vehículo:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ocurrió un error al guardar el vehículo'
    });
  } finally {
    console.groupEnd();
  }
}
  //filtrar datos
  search(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredVehiculos = this.vehiculos.filter(vehiculo => {
      // Verificación segura de propiedades
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
  onVehiculoSelect(event: any) {
    this.vehiculoSeleccionado = event;
  }
  clearSearch() {
    this.selectedVehiculo = null;
    this.filteredVehiculos = [];
    this.searchQuery = '';
    this.vehiculoSeleccionado = null;
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
