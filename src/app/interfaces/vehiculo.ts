export interface Vehiculo {
  vin: string;
  marca: string;
  estilo: string;
  color: string;
  anio: number;
  estado: string;
  observaciones: string;
  tarja: string; // Relación con Ingreso
}
