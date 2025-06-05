import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VehiculoService } from '../services/vehiculo.service';
import { DespachoService } from '../services/despacho.service';  // Import agregado
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Vehiculo } from '../interfaces/vehiculo';
import { Despacho } from '../interfaces/despacho';


@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [ CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, ReactiveFormsModule,
    DropdownModule, SelectButtonModule, EditorModule, InputTextareaModule,TagModule, AutoCompleteModule ],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() modoVisualizacion = false;
  @Input() vehiculoParaMostrar?: Despacho;
  @Input() vinsRegistrados: Vehiculo[] = [];

  @Output() guardarDespacho = new EventEmitter<Despacho>();

  despachoForm!: FormGroup;
  todayISO = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  vinFiltrados: Vehiculo[] = [];
  despachosRegistrados: Despacho[] = [];

  tiposDespacho: { name: string; value: 'DM' | 'TRANSITO' }[] = [
  { name: 'DM',       value: 'DM'      },
  { name: 'TRANSITO', value: 'TRANSITO'}
];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private vehiculoService: VehiculoService,
    private despachoService: DespachoService   // Servicio agregado
  ) {}

  ngOnInit() {
    // 1) Inicializas el form
    this.despachoForm = this.fb.group({
      fechaDespacho: ['', Validators.required],
      vin:           ['', Validators.required],
      tipoSalida:    [null as 'DM' | 'TRANSITO' | null, Validators.required],
      duca:          ['', Validators.required],
      motorista:     ['', Validators.required],
      notaDeLevante:   [''],
      observaciones: ['']
    });

    // 2) Si es modo visualización, parcheas los valores…
    if (this.modoVisualizacion && this.vehiculoParaMostrar) {
      const d = this.vehiculoParaMostrar;
      this.despachoForm.patchValue({
        fechaDespacho: formatDate(d.fechaDespacho, 'yyyy-MM-dd', 'en-US'),
        vin:           d.vin,
        tipoSalida:    d.tipoSalida,
        duca:          d.duca,
        motorista:     d.motorista,
        notaDeLevante:   d.notaDeLevante,
        observaciones: d.observaciones
      });
      this.despachoForm.disable();
    }

    // 3) Trae todos los despachos desde el backend y guárdalos en despachosRegistrados
    this.despachoService.getDespachos().subscribe({
      next: (lista) => {
        this.despachosRegistrados = lista;
      },
      error: (err) => {
        console.error('Error al cargar despachos:', err);
      }
    });

  }

  onShow() {
    if (!this.modoVisualizacion) {
      this.despachoForm.reset({
        fechaDespacho: '',
        vin:           '',
        tipoSalida:    null,
        duca:          '',
        motorista:     '',
        notaDeLevante:   '',
        observaciones: ''
      });
      this.despachoForm.markAsPristine();
      this.despachoForm.markAsUntouched();
    }
  }

  filtrarVins(event: { query: string }) {
  const q = event.query.toLowerCase();


  this.vehiculoService.getVehiculos().subscribe({
    next: (vehiculos: Vehiculo[]) => {
      this.vinFiltrados = vehiculos
        .filter((v: Vehiculo) => {
          // Si en despachosRegistrados ya existe un despacho con este VIN, lo descarto
          const yaHayDespacho = this.despachosRegistrados.some(
            (d: Despacho) => d.vin === v.vin
          );
          return !yaHayDespacho;
        })
        .filter((v: Vehiculo) =>
          // Solo dejo los que estén en estado 'Disponible' o 'Rescatado'
          v.estado === 'Disponible'
        )
        .filter((v: Vehiculo) =>
          // Por último, busco coincidencia en texto (sin diferenciar mayúsculas/minúsculas)
          v.vin.toLowerCase().includes(q)
        );
    },
    error: (err) => {
      console.error('Error al filtrar vehículos:', err);
      this.vinFiltrados = [];
    }
  });
}

  seleccionarVin(event: { originalEvent: Event; value: Vehiculo }) {
  const v: Vehiculo = event.value;
  this.despachoForm.get('vin')!.setValue(v.vin);
}

  cerrarDialogo() {
    this.visibleChange.emit(false);
  }

  onGuardar() {
    if (this.despachoForm.invalid) {
      this.despachoForm.markAllAsTouched();
      return;
    }
    const f = this.despachoForm.value;
    const nuevo: Despacho = {
      idDespacho:    Date.now(),
      fechaDespacho: f.fechaDespacho,
      vin:           f.vin,
      tipoSalida:    f.tipoSalida,
      duca:          f.duca,
      motorista:     f.motorista,
      notaDeLevante: f.notaLevante,
      observaciones: f.observaciones
    };
    this.guardarDespacho.emit(nuevo);
    this.visibleChange.emit(false);
  }

}
