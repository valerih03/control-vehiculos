import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ConsultarComponent } from "../consultar/consultar.component";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VehiculoService } from '../services/vehiculo.service';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, InputTextModule, CalendarModule, FormsModule, ConsultarComponent,
    ToastModule, ConfirmDialogModule, TableModule, RadioButtonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  dialogConsultaVisible: boolean = false;
  visible: boolean = false;
  vehiculos: any[] = [];

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
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private vehiculoService: VehiculoService
  ) {}

  showDialog() {
    this.visible = true;
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
        this.visible = false;
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada.' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Continuar', detail: 'Operación continuada.' });
      }
    });
  }

  guardarDatos() {
    this.vehiculoService.agregarVehiculo({ ...this.nuevoVehiculo });
    this.nuevoVehiculo = { ...this.nuevoVehiculo, anio: null };
    this.visible = false;
    this.vehiculos = this.vehiculoService.obtenerVehiculos();  // Actualizar la lista de vehículos
  }
}
