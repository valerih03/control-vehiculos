import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CommonModule, formatDate } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { RescateService } from '../../services/rescate.service';
import { Rescate } from '../../interfaces/rescate';
import { Vehiculo } from '../../interfaces/vehiculo';
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
    ToastModule,
    TableModule
  ],
  templateUrl: './rescate.component.html',
  styleUrls: ['./rescate.component.scss'],
  providers: [MessageService]
})
export class RescateComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() vehiculos: Vehiculo[] = [];
    // esperamos aquí todos los vehículos con el mismo BL
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() rescateCreado = new EventEmitter<Rescate>();

  formRescate!: FormGroup;
  todayISO = new Date().toISOString().slice(0, 10);
  minDate = this.todayISO;
  numerobl = '';

  constructor(
    private fb: FormBuilder,
    private msg: MessageService,
    private svc: RescateService
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehiculos'] && this.vehiculos.length > 0) {
      // extraer el BL del primer vehículo
      this.numerobl = this.vehiculos[0].numeroBL;
      // calcular fecha mínima (20 días después de ingreso, por ejemplo)
      const ing = new Date(this.vehiculos[0].fechaIngreso);
      ing.setDate(ing.getDate() + 20);
      this.minDate = ing.toISOString().slice(0, 10);

      // reset del formulario para cada apertura
      if (this.formRescate) {
        this.formRescate.reset({ fechaRescate: this.todayISO });
      }
    }
  }

  private inicializarFormulario(): void {
    this.formRescate = this.fb.group({
      fechaRescate: [ this.todayISO, Validators.required ]
    });
  }

  onConfirm(): void {
    if (this.formRescate.invalid) {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'La fecha es obligatoria.' });
      return;
    }
    const fecha = new Date(this.formRescate.value.fechaRescate);
    const nuevo: Rescate = {
      numeroBL:     this.numerobl,
      fechaRescate: fecha
    };

    // emite el rescate creado
    this.rescateCreado.emit(nuevo);
    this.visibleChange.emit(false);
    console.log('Rescate creado:', nuevo);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    this.formRescate.reset({ fechaRescate: this.todayISO });
  }
}
