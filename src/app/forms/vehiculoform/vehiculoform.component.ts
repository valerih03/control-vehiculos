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


  vehiculoForm!: FormGroup ;

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
        tarja:  '',
        consignatario:'',
        nit:          '',
        vin:          '',
        anio:         null,
        anioDate:     null, // para manejo de año
        marca:        '',
        estilo:       '',
        color:        '',
        observaciones:''
      });
    }
    else if (this.modo === 'editar' && this.vehiculo) {
      const v = this.vehiculo;

      // Fecha de ingreso
      let fechaIngresoISO: string | null = null;
      if (v.fechaIngreso) {
        const d = new Date(v.fechaIngreso);
        if (!isNaN(d.getTime())) {
          fechaIngresoISO = formatDate(d, 'yyyy-MM-dd', 'en-US');
        }
      }

      // Año: acepta number o ISO-string
      let anioValue = null;
      let anioDateValue = null;

      if (v.anio !== null && v.anio !== undefined) {
        if (typeof v.anio === 'number') {
          anioValue = v.anio;
          anioDateValue = new Date(v.anio, 0, 1);
        } else if (typeof v.anio === 'string' && /^\d{4}$/.test(v.anio)) {
          anioValue = parseInt(v.anio, 10);
          anioDateValue = new Date(anioValue, 0, 1);
        }
      }

      this.vehiculoForm.patchValue({
          fechaIngreso: fechaIngresoISO,
          numeroBL: v.numeroBL || '',
          tarja: v.tarja || '',
          consignatario: v.consignatario || '',
          nit: v.nit || '',
          vin: v.vin || '',
          anio: anioValue,
          anioDate: anioDateValue,
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
        fechaIngreso: [null, Validators.required],
        numeroBL:     ['', Validators.required],
        tarja:  ['', Validators.required],
        consignatario:['', Validators.required],
        nit:          ['', this.validacionService.getValidators('nit')],
        vin:          ['', this.validacionService.getValidators('vin')],
        anio:         [null, [Validators.required]],
        anioDate:     [null], //para manejo de año
        marca:        ['', Validators.required],
        estilo:       ['', Validators.required],
        color:        ['', Validators.required],
        observaciones:['']
      });
      this.syncYearFields();
  }

  private syncYearFields(): void {
  // Cuando cambia anioDate (selección en calendario)
  if (!this.vehiculoForm) return;

  const anioDateControl = this.vehiculoForm.get('anioDate');
  const anioControl = this.vehiculoForm.get('anio');

  if (!anioDateControl || !anioControl) return;

  anioDateControl.valueChanges.subscribe(date => {
    if (date) {
      const year = new Date(date).getFullYear();
      anioControl.setValue(year, { emitEvent: false });
    } else {
      anioControl.setValue(null, { emitEvent: false });
    }
  });

  anioControl.valueChanges.subscribe(year => {
    if (year) {
      const date = new Date(year, 0, 1);
      anioDateControl.setValue(date, { emitEvent: false });
    } else {
      anioDateControl.setValue(null, { emitEvent: false });
    }
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
    console.log('confirmSave() llamado en VehiculoformComponent. Form válido:',this.vehiculoForm.valid);

    this.messageService.clear();
    this.vehiculoForm.markAllAsTouched();
    if (this.vehiculoForm.invalid) {
      Object.entries(this.vehiculoForm.controls).forEach(([name, ctrl]) => {
        if (ctrl.invalid && name !== 'anioDate') {
          this.validacionService
            .getErrorMessages(name as any, ctrl)
            .forEach((msg) =>
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
              })
            );
        }
      });
      return;
    }
    const raw = this.vehiculoForm.getRawValue();
    const paraEmitir: Vehiculo = {
      idVehiculo: this.vehiculo!.idVehiculo!,
      fechaIngreso: raw.fechaIngreso!,
      tarja: raw.tarja!,
      numeroBL: raw.numeroBL!,
      consignatario: raw.consignatario!,
      nit: raw.nit!,
      vin: raw.vin!,
      anio: raw.anio!,
      marca: raw.marca!,
      estilo: raw.estilo!,
      color: raw.color!,
      estado: this.vehiculo!.estado!,  
      observaciones: raw.observaciones!,
    };

    // 3) Emito ese objeto
    this.guardar.emit(paraEmitir);
    console.log('Vehículo guardado (emit):', paraEmitir);
  }

  onCancel() {
    this.cancelar.emit();
  }
}
