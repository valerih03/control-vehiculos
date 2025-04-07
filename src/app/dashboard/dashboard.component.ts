import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DialogModule, CommonModule ,ButtonModule, InputTextModule, CalendarModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  visible: boolean = false; // Variable que controla la visibilidad

  anio!: number;
  showDialog() {
    console.log('Show dialog clicked');
    this.visible = true;
  }

}
