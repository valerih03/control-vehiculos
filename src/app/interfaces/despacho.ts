export interface Despacho {
  idDespacho: number;
  fechaDespacho: string;        // ISO format
  vin: string;                  // Relación con Vehiculo
  tipoSalida: string;
  responsableDes: string;
  notaLevantE: string;
}
