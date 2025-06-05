import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DespacharComponent } from './despachar/despachar.component';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'despachar',
    loadComponent: () => import('./despachar/despachar.component').then(m => m.DespacharComponent)
  },
];
