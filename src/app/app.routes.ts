import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConsultarComponent } from './consultar/consultar.component';
import { ActualizarComponent } from './actualizar/actualizar.component';
import { DespacharComponent } from './despachar/despachar.component';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'consultar',
    loadComponent: () => import('./consultar/consultar.component').then(m => m.ConsultarComponent)
  },
  {
    path: 'actualizar',
    loadComponent: () => import('./actualizar/actualizar.component').then(m => m.ActualizarComponent)
  },
  {
    path: 'despachar',
    loadComponent: () => import('./despachar/despachar.component').then(m => m.DespacharComponent)
  },
];
