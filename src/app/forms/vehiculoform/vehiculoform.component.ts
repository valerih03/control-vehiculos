import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ValidacionService } from '../../services/validacion.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-vehiculoform',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, CalendarModule, CheckboxModule],
  templateUrl: './vehiculoform.component.html',
  styleUrl: './vehiculoform.component.css'
})
export class VehiculoformComponent {

  private _modo: 'crear' | 'editar' = 'crear';
  private _vehiculo: any = {
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

  @Input()
  set vehiculo(value: any) {
    this._vehiculo = value;
  }
  get vehiculo(): any {
    return this._vehiculo;
  }

  @Input()
  set modo(value: 'crear' | 'editar') {
    this._modo = value;
    if (value === 'crear') {
      // Para creación, se reinicia el checkbox
      this.realizarRescate = false;
    }
    // En modo editar, la actualización del estado del checkbox se hará en ngOnChanges
  }
  get modo(): 'crear' | 'editar' {
    return this._modo;
  }

  // Se emiten eventos al guardar o cancelar
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  // Control del checkbox para rescate
  realizarRescate: boolean = false;

  constructor(private validacionService: ValidacionService, private messageService: MessageService) {}

  // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehiculo'] && this.modo === 'editar') {
      // Si el vehículo a editar tiene valor en fechares, se marca el checkbox
      this.realizarRescate = !!this.vehiculo.fechares;
    }
  }

  onRescateChange() {
    if (!this.realizarRescate) {
      this.vehiculo.fechares = '';
    }
  }

  confirmSave() {
    // Se valida el vehículo usando el servicio de validación existente
    const validacion = this.validacionService.validarVehiculo({
      ...this.vehiculo,
      realizarRescate: this.realizarRescate
    });
    if (!validacion.isValid) {
      validacion.errors.forEach(error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      });
      return;
    }
    // Emitir el objeto para que el componente padre decida si se agrega o actualiza
    this.guardar.emit(this.vehiculo);
  }

  onCancel() {
    this.cancelar.emit();
  }
}
