export interface Despacho {
  idDespacho?: number;
  fechaDespacho: Date | string;       // ISO format
  vin: string;             // Relación con Vehiculo
  tipoSalida: string;
  duca: string;
  motorista: string;
  notaDeLevante: string;
  observaciones: string;
}
