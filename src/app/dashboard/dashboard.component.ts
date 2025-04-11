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
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, FormsModule,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule, SplitButtonModule, DespacharComponent],
  providers: [ConfirmationService, MessageService, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  //consultar
  dialogIngresoVisible = false;
  dialogConsultaVisible = false;
  dialogEdicionVisible = false;
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
exportarPDF() {
  // Verificar si hay datos primero
  if (!this.vehiculos || this.vehiculos.length === 0) {
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

        // Configuración
        const fecha = new Date().toLocaleString();
        const titulo = 'REPORTE DE VEHÍCULOS';
        const pageWidth = doc.internal.pageSize.getWidth();

        // Encabezado
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${fecha}`, pageWidth / 2, 28, { align: 'center' });

        // Datos de la tabla
        const headers = ['VIN', 'Consignatario', 'NIT', 'Fecha', 'Marca', 'Estilo', 'Despacho'];
        const data = this.vehiculos.map(v => [
          v.vin || 'N/A',
          v.consignatario || 'N/A',
          v.nit || 'N/A',
          v.fecha || 'N/A',
          v.marca || 'N/A',
          v.estilo || 'N/A',
          v.despacho || 'N/A'
        ]);

        // Generar tabla
        autoTableModule.default(doc, {
          head: [headers],
          body: data,
          startY: 35,
          margin: { horizontal: 10 },
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [13, 71, 161], // Azul más oscuro
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          columnStyles: {
            0: { cellWidth: 25 }, // Ancho columna VIN
            1: { cellWidth: 30 }  // Ancho consignatario
          }
        });

        // Pie de página
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10
          );
        }

        // Guardar PDF
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
