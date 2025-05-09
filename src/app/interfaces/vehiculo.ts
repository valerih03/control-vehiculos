export interface Vehiculo {
  id: number;
  fechaIngreso: Date | string;
  numeroTarja: string;
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
