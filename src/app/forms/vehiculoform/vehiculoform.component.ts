import {Component,Input,Output,EventEmitter,SimpleChanges,OnInit,OnChanges,} from '@angular/core';
import { ValidacionService } from '../../services/validacion.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators,  ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-vehiculoform',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DialogModule, ButtonModule,
    InputTextModule, CalendarModule, CheckboxModule, InputMaskModule,
  ],
  templateUrl: './vehiculoform.component.html',
  styleUrl: './vehiculoform.component.css',
})
export class VehiculoformComponent implements OnInit, OnChanges {
  readonly VIN_LENGTH = 17;
  today: Date = new Date();
  todayISO!: string;

  @Input() vehiculo: any = {
    fechaIngreso: '',
    numeroBL: '',
    numeroTarja: '',
    consignatario: '',
    nit: '',
    fecha: '',
    vin: '',
    anio: null,
    marca: '',
    estilo: '',
    color: '',
    observaciones: ''
  };
  @Input() modo: 'crear' | 'editar' = 'crear';
  // Se emiten eventos al guardar o cancelar
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  private defaultVehiculo = {
    fechaIngreso: '',
    numeroBL: '',
    numeroTarja: '',
    consignatario: '',
    nit: '',
    vin: '',
    anio: null,
    marca: '',
    estilo: '',
    color: '',
    observaciones: ''
  };
  vehiculoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService
  ) {}
  // En lugar de una fecha fija 2026
  currentYear = new Date().getFullYear();
  maxAnio = new Date(this.currentYear + 1, 11, 31); // Diciembre del año siguiente  // diciembre es 11 (0-indexed)

  ngOnInit() {
    this.inicializarFormulario();
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  private inicializarFormulario() {
    this.vehiculoForm = this.fb.group({
      fechaIngreso: [this.vehiculo.fechaIngreso || '', Validators.required],
      numeroBL: [this.vehiculo.numeroBL || '', Validators.required],
      numeroTarja: [this.vehiculo.numeroTarja || '', Validators.required],
      consignatario: [this.vehiculo.consignatario || '', Validators.required],
      nit: [this.vehiculo.nit || '', this.validacionService.getValidators('nit')],
      vin: [
        {value: this.vehiculo.vin || '', disabled: this.modo === 'editar'},
        this.validacionService.getValidators('vin')
      ],
      anio: [this.vehiculo.anio || null, [Validators.required, Validators.min(1900), Validators.max(this.currentYear + 1)]],
      marca: [this.vehiculo.marca || '', Validators.required],
      estilo: [this.vehiculo.estilo || '', Validators.required],
      color: [this.vehiculo.color || '', Validators.required],
      observaciones: [this.vehiculo.observaciones || '']
    });
  }
  resetForm() {
    this.vehiculoForm.reset(this.defaultVehiculo);
    // Marca todos los controles como 'untouched' para limpiar los mensajes de error
    Object.keys(this.vehiculoForm.controls).forEach(key => {
      this.vehiculoForm.get(key)?.markAsUntouched();
    });
  }

  //para los mensajes de error
  getErrores(campo: string): string[] {
    const ctrl = this.vehiculoForm.get(campo);
    if (!ctrl) return [];

    if (campo === 'anio') {
      if (ctrl.hasError('required')) {
        return ['El año es requerido'];
      }
      if (ctrl.hasError('min')) {
        return ['El año no puede ser menor a 1990'];
      }
      if (ctrl.hasError('max')) {
        return [`El año no puede ser mayor a ${this.currentYear + 1}`];
      }
    }

    return this.validacionService.getErrorMessages(campo as any, ctrl);
  }
  // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehiculo'] && this.vehiculo) {
      const v = this.vehiculo;
       // Convertir el año a Date si es necesario
    let anioValue = v.anio;
    if (anioValue && !(anioValue instanceof Date)) {
      // Si es string o número, convertirlo a Date
      anioValue = new Date(anioValue.toString());
    }
      const formData = {
        fechaIngreso: v.fechaIngreso || '',
        numeroBL: v.numeroBL || '',
        numeroTarja: v.numeroTarja || '',
        consignatario: v.consignatario || '',
        nit: v.nit || '',
        vin: v.vin || '',
        anio: anioValue || null,
        marca: v.marca || '',
        estilo: v.estilo || '',
        color: v.color || '',
        observaciones: v.observaciones || ''
      };

      if (!this.vehiculoForm) {
        this.inicializarFormulario();
      } else {
        this.vehiculoForm.patchValue(formData);
      }
    }
  }
  confirmSave() {
    // Limpia mensajes anteriores
    this.messageService.clear();

    // Marca todos los campos como 'touched' para que aparezcan los mensajes inline
    this.vehiculoForm.markAllAsTouched();

    // Si hay errores, los mostramos (filtrando los de longitud en VIN) y salimos
    if (this.vehiculoForm.invalid) {
      Object.keys(this.vehiculoForm.controls).forEach(name => {
        const ctrl = this.vehiculoForm.get(name)!;
        if (ctrl.invalid) {
          // obtenemos todos los mensajes
          let mensajes = this.getErrores(name);

          // si es VIN
          if (name === 'vin') {
            mensajes = mensajes.filter(msg =>
              !msg.toLowerCase().includes('debe tener')
            );
          }

          // mostramos los mensajes filtrados en la alerta
          mensajes.forEach(msg => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: msg
            });
          });
        }
      });
      return;  // detenemos la ejecución para no emitir guardar
    }

    //Si todo es válido, emitimos para guardar/actualizar
    this.guardar.emit(this.vehiculoForm.getRawValue());
    this.resetForm();
  }
  // Helper para mapear formControlName
  private obtenerEtiqueta(cn: string) {
    const labels: Record<string, string> = {
      consignatario: 'Consignatario',
      nit: 'NIT',
      vin: 'VIN',
      anio: 'Año',
      marca: 'Marca',
      estilo: 'Estilo',
      color: 'Color',
      abandono: 'Abandono',
      despacho: 'Despacho',
      fechares: 'Fecha de rescate',
    };
    return labels[cn] || cn;
  }
 onCancel() {
  this.resetForm();
  this.cancelar.emit();
  }
}
