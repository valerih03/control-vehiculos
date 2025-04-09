import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultarComponent } from './consultar/consultar.component';
import { ActualizarComponent } from './actualizar/actualizar.component';
export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'consultar', component: ConsultarComponent},
  {path: 'actualizar', component: ActualizarComponent},
];
