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
import { Vehiculo } from '../../interfaces/vehiculo';

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

  @Input() vehiculo: Partial<Vehiculo> = {};
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Output() guardar = new EventEmitter<Vehiculo>();
  @Output() cancelar = new EventEmitter<void>();


  vehiculoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService
  ) {}
  currentYear = new Date().getFullYear();
  maxAnio = new Date(this.currentYear + 1, 11, 31); 

  ngOnInit() {
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.initForm();
  }

    // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['modo'] && this.vehiculoForm) {
        if (this.modo === 'crear') {
          this.vehiculoForm.reset();
        } else if (this.modo === 'editar' && changes['vehiculo']) {
          const v = this.vehiculo;
          this.vehiculoForm.reset({
            fechaIngreso: v.fechaIngreso ? new Date(v.fechaIngreso) : null,
            numeroBL: v.numeroBL || '',
            numeroTarja: (v as any).numeroTarja ?? v.tarja ?? '',
            consignatario: v.consignatario || '',
            nit: v.nit || '',
            vin: v.vin || '',
            anio: v.anio
              ? typeof v.anio === 'string'
                ? new Date(v.anio)
                : new Date(v.anio)
              : null,
            marca: v.marca || '',
            estilo: v.estilo || '',
            color: v.color || '',
            observaciones: v.observaciones || ''
          });
        }
      }
    }

    private initForm(): void {
      this.vehiculoForm = this.fb.group({
        fechaIngreso: [
          this.vehiculo.fechaIngreso ? new Date(this.vehiculo.fechaIngreso) : null,
          Validators.required
        ],
        numeroBL: [this.vehiculo.numeroBL || '', Validators.required],
        numeroTarja: [
          (this.vehiculo as any).numeroTarja ?? this.vehiculo.tarja ?? '',
          Validators.required
        ],
        consignatario: [this.vehiculo.consignatario || '', Validators.required],
        nit: [
          this.vehiculo.nit || '',
          this.validacionService.getValidators('nit')
        ],
        vin: [
          this.vehiculo.vin || '',
          this.validacionService.getValidators('vin')
        ],
        anio: [
          this.vehiculo.anio
            ? typeof this.vehiculo.anio === 'string'
              ? new Date(this.vehiculo.anio)
              : new Date(this.vehiculo.anio)
            : null,
          [Validators.required]
        ],
        marca: [this.vehiculo.marca || '', Validators.required],
        estilo: [this.vehiculo.estilo || '', Validators.required],
        color: [this.vehiculo.color || '', Validators.required],
        observaciones: [this.vehiculo.observaciones || '']
      });
    }
  //para los mensajes de error
  getErrores(campo: string): string[] {
    const ctrl = this.vehiculoForm.get(campo);
    return ctrl
      ? this.validacionService.getErrorMessages(campo as any, ctrl)
      : [];
  }

  confirmSave() {
    this.messageService.clear();
    this.vehiculoForm.markAllAsTouched();
    if (this.vehiculoForm.invalid) {
      Object.entries(this.vehiculoForm.controls).forEach(([name, ctrl]) => {
        if (ctrl.invalid) {
          let mensajes = this.getErrores(name);
          if (name === 'vin') {
            mensajes = mensajes.filter(msg =>
              !msg.toLowerCase().includes('debe tener')
            );
          }
          mensajes.forEach(msg =>
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg })
          );
        }
      });
      return;
    }
    this.guardar.emit(this.vehiculoForm.getRawValue() as Vehiculo);
    console.log('Vehículo guardado:', this.vehiculoForm.getRawValue());
  }
 onCancel() {
    this.cancelar.emit();
  }
}
