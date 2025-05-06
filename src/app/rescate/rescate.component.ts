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
import { TableModule } from 'primeng/table';


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
export class RescateComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() vehiculos: any[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmar = new EventEmitter<string>();

  formRescate!: FormGroup;
  todayISO!: string;
  minDate!: string;
  constructor(private fb: FormBuilder) {
    this.todayISO = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.inicializarFormulario();

    if(this.vehiculos.length > 0){
      const fechaIngreso = new Date(this.vehiculos[0].fechaIngreso);
      fechaIngreso.setDate(fechaIngreso.getDate()+20);
      this.minDate = fechaIngreso.toISOString().split('T')[0];
    }
  }

  private inicializarFormulario(): void {
    this.formRescate = this.fb.group({
      fechaRescate: [this.todayISO, Validators.required] // Valor inicial como string
    });
  }

  onConfirm() {
    if (this.formRescate.valid) {
      // Convertimos a Date si es necesario
      const fecha = new Date(this.formRescate.value.fechaRescate);
      this.confirmar.emit(fecha.toISOString());
      this.visibleChange.emit(false);
    }
  }

  onCancel() {
    this.visibleChange.emit(false);
    this.formRescate.reset({ fechaRescate: this.todayISO });
  }
}
