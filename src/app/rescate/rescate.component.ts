import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CommonModule, formatDate } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-rescate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    RadioButtonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './rescate.component.html',
  styleUrls: ['./rescate.component.scss'],
  providers: [MessageService]
})
export class RescateComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() registroSeleccionado: any = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() alGuardar = new EventEmitter<any>();

  formularioRescate: FormGroup;
  fechaActual: Date;
  fechaMinima: Date;

  today: Date = new Date();
  todayISO!: string;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    // Inicializamos las fechas
    const hoy = new Date();
    this.fechaActual = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    this.fechaMinima = new Date(2000, 0, 1); // Fecha mínima arbitraria (1/1/2000)

    this.formularioRescate = this.fb.group({
      realizarRescate: [false, [Validators.requiredTrue]],
      tarja: [{ value: '', disabled: true }],
      bl: [{ value: '', disabled: true }],
      fechaRescate: [{ value: this.fechaActual, disabled: false }, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  // Getters seguros para los controles
  get realizarRescateControl(): FormControl {
    return this.formularioRescate.get('realizarRescate') as FormControl;
  }

  get fechaRescateControl(): FormControl {
    return this.formularioRescate.get('fechaRescate') as FormControl;
  }

  get tarjaControl(): FormControl {
    return this.formularioRescate.get('tarja') as FormControl;
  }

  get blControl(): FormControl {
    return this.formularioRescate.get('bl') as FormControl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registroSeleccionado'] && this.registroSeleccionado) {
      this.actualizarCampos();
    }
  }

  private actualizarCampos(): void {
    this.formularioRescate.patchValue({
      tarja: this.registroSeleccionado?.numeroTarja || '',
      bl: this.registroSeleccionado?.numeroBL || ''
    });
  }

  confirmarRescate(): void {
    this.realizarRescateControl.setValue(true);
  }

  guardar(): void {
    if (this.formularioRescate.invalid) {
      this.mostrarErrorValidacion();
      return;
    }
    // Validación adicional de fecha por si acaso
    const fechaSeleccionada = new Date(this.fechaRescateControl.value);
    if (fechaSeleccionada > this.fechaActual) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puede seleccionar una fecha futura',
        life: 5000
      });
      return;
    }
    const datosRescate = {
      tarja: this.registroSeleccionado.numeroTarja,
      bl: this.registroSeleccionado.numeroBL,
      fechaRescate: this.fechaRescateControl.value,
      vin: this.registroSeleccionado.vin
    };
    this.alGuardar.emit(datosRescate);
    this.cerrar();
    console.log('Datos de rescate guardados:', datosRescate);
  }
  private mostrarErrorValidacion(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debe confirmar el rescate y seleccionar una fecha válida',
      life: 5000
    });
  }
  cerrar(): void {
    this.formularioRescate.reset({
      realizarRescate: false,
      fechaRescate: this.fechaActual
    });
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
