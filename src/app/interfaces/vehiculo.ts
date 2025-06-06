export interface Vehiculo {
  idVehiculo?: number;
  fechaIngreso: Date | string;
  tarja: string;
  numeroBL: string;
  consignatario: string;
  vin: string;
  nit: string;
  marca: string;
  estilo: string;
  color: string;
  anio: number;
  estado: string;
  observaciones: string;
}
