import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnInit,
  OnChanges,
} from '@angular/core';
import { ValidacionService } from '../../services/validacion.service';
import { MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    CheckboxModule,
    InputMaskModule,
  ],
  templateUrl: './vehiculoform.component.html',
  styleUrl: './vehiculoform.component.css',
})
export class VehiculoformComponent implements OnInit, OnChanges {
  readonly VIN_LENGTH = 17;
  today: Date = new Date();
  todayISO!: string;

  @Input() vehiculo: any = {
    consignatario: '',
    nit: '',
    fecha: '',
    vin: '',
    anio: null,
    marca: '',
    estilo: '',
    color: '',
  };
  @Input() modo: 'crear' | 'editar' = 'crear';
  // Se emiten eventos al guardar o cancelar
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  private defaultVehiculo = {
    consignatario: '',
    nit: '',
    fecha: '',
    vin: '',
    anio: null,
    marca: '',
    estilo: '',
    color: '',
  };

  vehiculoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService
  ) {}
  maxAnio = new Date(2026, 11, 31);  // diciembre es 11 (0-indexed)

  ngOnInit() {
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.vehiculoForm = this.fb.group({
      consignatario: [this.vehiculo.consignatario || '', Validators.required],
      nit: [
        this.vehiculo.nit || '',
        this.validacionService.getValidators('nit'),
      ],
      fecha: [
        this.vehiculo.fecha || '',
        this.validacionService.getValidators('fecha'),
      ],
      vin: [
        this.vehiculo.vin || '',
        this.validacionService.getValidators('vin'),
      ],
      anio: [
        this.vehiculo.anio || null,
        [Validators.required, Validators.min(1990), Validators.max(2026)]
      ],
      marca: [this.vehiculo.marca || '', Validators.required],
      estilo: [this.vehiculo.estilo || '', Validators.required],
      color: [this.vehiculo.color || '', Validators.required],
    });
  }
  //para los mensajes de error
  getErrores(campo: string): string[] {
    const ctrl = this.vehiculoForm.get(campo);
    return ctrl
      ? this.validacionService.getErrorMessages(campo as any, ctrl)
      : [];
  }

  // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['modo'] && this.vehiculoForm) {
      if (this.modo === 'crear') {
        this.vehiculoForm.reset(this.defaultVehiculo);
        this.vehiculoForm.get('fechares')!.disable();
      } else if (this.modo === 'editar' && changes['vehiculo']) {
        const v = this.vehiculo;
        this.vehiculoForm.reset({
          ...v,
          realizarRescate: !!v.fechares,
          fechares: v.fechares || null, // ← aquí sí asignas 'fechares'
        });
        if (v.fechares) {
          this.vehiculoForm.get('fechares')!.enable();
        } else {
          this.vehiculoForm.get('fechares')!.disable();
        }
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
  }


  // Helper para mapear formControlName
  private obtenerEtiqueta(cn: string) {
    const labels: Record<string, string> = {
      consignatario: 'Consignatario',
      nit: 'NIT',
      fecha: 'Fecha',
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
    this.cancelar.emit();
  }
}
