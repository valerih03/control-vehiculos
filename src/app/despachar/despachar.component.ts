import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-despachar',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule],
  templateUrl: './despachar.component.html',
  styleUrls: ['./despachar.component.css']
})
export class DespacharComponent {
  @Output() cerrar = new EventEmitter<void>();
  // Variables para mostrar formularios
  mostrarDM = false;
  mostrarTransito = false;

  despachoDM = {
    bl: '',
    duca: ''
  };
  despachoTransito = {
    copiaBL: '',
    duca: '',
    tarja: ''
  };
  constructor(private messageService: MessageService) {}
  seleccionarTipo(tipo: string) {
    if (tipo === 'DM') {
      this.mostrarDM = true;
    } else {
      this.mostrarTransito = true;
    }
  }
  guardarDM() {
    console.log('Guardando DM:', this.despachoDM);
    this.mostrarDM = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Despacho DM registrado'
    });
    this.limpiarFormularios();
    this.cerrar.emit();
  }
  guardarTransito() {
    console.log('Guardando TRANSITO:', this.despachoTransito);
    this.mostrarTransito = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Despacho Tránsito registrado'
    });
    this.limpiarFormularios();
    this.cerrar.emit();
  }
  limpiarFormularios() {
    this.despachoDM = { bl: '', duca: '' };
    this.despachoTransito = { copiaBL: '', duca: '', tarja: '' };
  }
  cancelar() {
    this.limpiarFormularios();
    this.cerrar.emit();
  }
}
