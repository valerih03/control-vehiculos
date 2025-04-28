import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ValidacionService } from '../../services/validacion.service';
import { CommonModule, formatDate } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { VehiculoformComponent } from '../vehiculoform/vehiculoform.component';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, CalendarModule, VehiculoformComponent, DialogModule,
             ReactiveFormsModule, InputGroupModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  showVehiculoForm = false;
  todayISO!: string;

  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private validacionService: ValidacionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Inicializamos el form reactivo
    this.todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

    this.registroForm = this.fb.group({
      fechaIngreso: ['', Validators.required],
      numeroBL: ['', Validators.required],
      numeroTarja: ['', Validators.required],
      vehiculo: this.fb.group({})  // se setea cuando guardes el form de vehículo
    });
  }

  openVehiculoForm() {
    this.showVehiculoForm = true;
  }

  onVehiculoGuardar(vehiculoData: any) {
    // incrustamos el sub-form del vehículo
    this.registroForm.setControl(
      'vehiculo',
      this.fb.control(vehiculoData)
    );
    this.showVehiculoForm = false;
  }

  confirmSave() {
    this.messageService.clear();
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) {
      // mostramos alertas globales según el campo
      if (this.registroForm.get('fechaIngreso')?.hasError('required')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La fecha de ingreso es requerida.'
        });
      }
      if (this.registroForm.get('numeroBL')?.hasError('required')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El número BL es requerido.'
        });
      }
      if (this.registroForm.get('numeroTarja')?.hasError('required')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La tarja es requerida.'
        });
      }
      return;
    }

    // emitimos al padre el objeto completo
    this.guardar.emit(this.registroForm.getRawValue());
  }

  onCancel() {
    this.cancelar.emit();
  }
}
