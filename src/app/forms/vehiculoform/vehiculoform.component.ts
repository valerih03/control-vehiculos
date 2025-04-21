import { Component, Input, Output, EventEmitter, SimpleChanges,OnInit, OnChanges } from '@angular/core';
import { ValidacionService } from '../../services/validacion.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule,
            CalendarModule, CheckboxModule, InputMaskModule],
  templateUrl: './vehiculoform.component.html',
  styleUrl: './vehiculoform.component.css'
})
export class VehiculoformComponent implements OnInit, OnChanges{


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
    abandono: '',
    fechares: '',
    despacho: ''
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
    abandono: '',
    despacho: '',
    realizarRescate: false,
    fechares: null
  };

  vehiculoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService,
  ){}


  ngOnInit(){
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.vehiculoForm = this.fb.group({
      consignatario:  [this.vehiculo.consignatario || '', Validators.required],
      nit:           [this.vehiculo.nit          || '', this.validacionService.getValidators('nit')],
      fecha:         [this.vehiculo.fecha        || '', this.validacionService.getValidators('fecha')],
      vin:           [this.vehiculo.vin          || '', this.validacionService.getValidators('vin')],
      anio:          [this.vehiculo.anio         || null, this.validacionService.getValidators('anio')],
      marca:         [this.vehiculo.marca        || '', Validators.required],
      estilo:        [this.vehiculo.estilo       || '', Validators.required],
      color:         [this.vehiculo.color        || '', Validators.required],
      abandono:      [this.vehiculo.abandono     || ''],
      despacho:      [this.vehiculo.despacho     || ''],
      realizarRescate:[!!this.vehiculo.fechares],
      fechares:      this.fb.control(
                       { value: this.vehiculo.fechares || null,
                         disabled: !this.vehiculo.fechares },
                       this.validacionService.getValidators('fechares')
                     )
    });

    // Por si acaso el subscription no dispara antes:
    if (!this.vehiculoForm.get('realizarRescate')!.value) {
      this.vehiculoForm.get('fechares')!.disable();
    }

    //esto sincroniza el chackbox en el habilitado
    this.vehiculoForm.get('realizarRescate')!.valueChanges.subscribe(checked => {
      const ctrl = this.vehiculoForm.get('fechares')!;
      if (checked) {
        const vFn = this.validacionService.getValidators('fechares');
        ctrl.setValidators([ Validators.required, ...vFn ]);
        ctrl.enable();
      } else {
        ctrl.clearValidators();
        ctrl.setValue(null);
        ctrl.disable();
      }
      ctrl.updateValueAndValidity();
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
      }
      else if (this.modo === 'editar' && changes['vehiculo']) {
        const v = this.vehiculo;
        this.vehiculoForm.reset({
          ...v,
          realizarRescate: !!v.fechares,
          fechares: v.fechares || null    // ← aquí sí asignas 'fechares'
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
    if(this.vehiculoForm.invalid){
      //mostrar los errores campo a campo
      Object.entries(this.vehiculoForm.controls).forEach(([name, ctrl])=>{
        if(ctrl.invalid){
          Object.keys(ctrl.errors!).forEach(errorKey => {
            this.getErrores(name).forEach(msg=>{
              this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: msg
              })

            });
          });
        }
      });
      return;
    }
    // Emitir el objeto para que el componente padre decida si se agrega o actualiza
    this.guardar.emit(this.vehiculoForm.getRawValue());
  }

  // Helper para mapear formControlName
  private obtenerEtiqueta(cn: string) {
    const labels: Record<string,string> = {
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
      fechares: 'Fecha de rescate'
    };
    return labels[cn] || cn;
  }

  onCancel() {
    this.cancelar.emit();
  }
}
