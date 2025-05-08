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
  maxAnio = new Date(2026, 11, 31);  // diciembre es 11 (0-indexed)

  ngOnInit() {
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.initForm();
  }

    // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
    ngOnChanges(changes: SimpleChanges): void {
      if (!this.vehiculoForm) {
        this.initForm();
      }

      if (changes['modo'] || changes['vehiculo']) {
        if (this.modo === 'crear') {
          this.vehiculoForm.reset({
            fechaIngreso: null,
            numeroBL:     '',
            numeroTarja:  '',
            consignatario:'',
            nit:          '',
            vin:          '',
            anio:         null,
            marca:        '',
            estilo:       '',
            color:        '',
            observaciones:''
          });
        } else if (this.modo === 'editar' && this.vehiculo) {
          const v = this.vehiculo;

          // Normalizar fechaIngreso a Date o null
          let fechaIngresoDate: Date | null = null;
          if (v.fechaIngreso) {
            // Si viene como Date
            if (v.fechaIngreso instanceof Date) {
              fechaIngresoDate = v.fechaIngreso;
            } else if (typeof v.fechaIngreso === 'string') {
              // Intentar parsear cualquier formato ISO
              const d = new Date(v.fechaIngreso);
              if (!isNaN(d.getTime())) {
                fechaIngresoDate = d;
              }
            }
          }

          // Convertir anio:number a Date en 1 de enero de ese año
          let anioDate: Date | null = null;
          if (typeof v.anio === 'number') {
            anioDate = new Date(v.anio, 0, 1);
          }

          this.vehiculoForm.reset({
            fechaIngreso: fechaIngresoDate,
            numeroBL:     v.numeroBL    ?? '',
            numeroTarja:  (v as any).numeroTarja ?? v.tarja ?? '',
            consignatario:v.consignatario ?? '',
            nit:          v.nit         ?? '',
            vin:          v.vin         ?? '',
            anio:         anioDate,
            marca:        v.marca       ?? '',
            estilo:       v.estilo      ?? '',
            color:        v.color       ?? '',
            observaciones:v.observaciones ?? ''
          });
        }
      }
    }
    private initForm(): void {
      this.vehiculoForm = this.fb.group({
        fechaIngreso: [null, Validators.required],
        numeroBL:     ['', Validators.required],
        numeroTarja:  ['', Validators.required],
        consignatario:['', Validators.required],
        nit:          ['', this.validacionService.getValidators('nit')],
        vin:          ['', this.validacionService.getValidators('vin')],
        anio:         [null, [Validators.required]],
        marca:        ['', Validators.required],
        estilo:       ['', Validators.required],
        color:        ['', Validators.required],
        observaciones:['']
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
          this.validacionService
            .getErrorMessages(name as any, ctrl)
            .forEach(msg =>
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
