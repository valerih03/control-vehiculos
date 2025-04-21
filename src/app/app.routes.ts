import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultarComponent } from './consultar/consultar.component';
import { ActualizarComponent } from './actualizar/actualizar.component';
import { DespacharComponent } from './despachar/despachar.component';
import { DetdespachoComponent } from './detdespacho/detdespacho.component';
export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'consultar', component: ConsultarComponent},
  {path: 'actualizar', component: ActualizarComponent},
  {path: 'despachar', component: DespacharComponent},
  {path: 'detalledespacho', component: DetdespachoComponent},
];
