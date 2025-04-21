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

@Component({
  selector: 'app-vehiculoform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, CalendarModule, CheckboxModule],
  templateUrl: './vehiculoform.component.html',
  styleUrl: './vehiculoform.component.css'
})
export class VehiculoformComponent implements OnInit, OnChanges{

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

  vehiculoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService,
  ){}

  ngOnInit(){
    this.vehiculoForm = this.fb.group({
      consignatario: [this.vehiculo.consignatario || '', Validators.required],
      nit: [this.vehiculo.nit || '', Validators.pattern(/^(\d{8}|\d{7}-\d)$/)],
      fecha: [this.vehiculo.fecha || '',[
        Validators.required,
        this.validacionService.validarFechaPasada.bind(this.validacionService)
      ]],
      vin: [this.vehiculo.vin || '', [
        Validators.required,
        Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/i)
      ]],
      anio: [this.vehiculo.anio || null, this.validacionService.validarAnio(1990,2050)],
      marca: [this.vehiculo.marca || '', Validators.required],
      estilo: [this.vehiculo.estilo || '', Validators.required],
      color: [this.vehiculo.color || '', Validators.required],
      abandono: [this.vehiculo.abandono || ''],
      despacho: [this.vehiculo.despacho || ''],
      realizarRescate: [!!this.vehiculo.fechares],
      fechares: [{value: this.vehiculo.fechares || '', disable:!this.vehiculo.fechares},[
        this.validacionService.validarFechaRescate('fecha').bind(this.validacionService)
      ]]
    });

    //esto sincroniza el chackbox en el habilitado
    this.vehiculoForm.get('realizarRescate')!
      .valueChanges
      .subscribe(checked => {
        const ctrl = this.vehiculoForm.get('fechares')!;
        if(checked){
          ctrl.enable();
          ctrl.setValidators([
            Validators.required,
            this.validacionService.validarFechaRescate('fecha').bind(this.validacionService)
          ]);
        }else{
          ctrl.disable();
          ctrl.clearValidators();
        }
        ctrl.updateValueAndValidity();
      });
  }

  // ngOnChanges se invoca cuando cambian los Inputs (por ejemplo, cuando se asigna un vehículo para editar)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modo'] && this.vehiculoForm) {
      this.vehiculoForm.patchValue({
        ...this.vehiculo,
        realizarRescate: !!this.vehiculo.fechares
      });
    }
  }

  confirmSave() {
    if(this.vehiculoForm.invalid){
      //mostrar los errores campo a campo
      Object.entries(this.vehiculoForm.controls).forEach(([name, ctrl])=>{
        if(ctrl.invalid){
          Object.keys(ctrl.errors!).forEach(errorKey => {
            this.messageService.add({
              severity: 'error',
              summary:'Error',
              detail: this.validacionService.getMensajeError(
                this.obtenerEtiqueta(name), errorKey
              )
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
