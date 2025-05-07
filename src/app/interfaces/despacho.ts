export interface Despacho {
  idDespacho: number;
  fechaDespacho: string;        // ISO format
  vin: string;             // Relación con Vehiculo
  tipoSalida: string;
  duca: string;
  motorista: string;
  notadelevante: string;
  observaciones: string;
}
