import { Component } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterModule, DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'control-veh';
}
