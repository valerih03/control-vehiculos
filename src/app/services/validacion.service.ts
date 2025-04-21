import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors,ValidatorFn, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ValidacionService {


  //para los patrones de nit y vin
  private patterns={
    nit: /^\d{4}-\d{6}-\d{3}-\d$/,
    vin: /^[A-HJ-NPR-Z0-9]{17}$/i
  };

  //para las etiquetas
  private labels: Record<string, string>={
    consignatario: 'Consignatario',
    nit:            'NIT',
    fecha:          'Fecha',
    vin:            'VIN',
    anio:           'Año',
    fechares:       'Fecha de rescate',
    marca:          'Marca',
    estilo:         'Estilo',
    color:          'Color',
    abandono:       'Abandono',
    despacho:       'Despacho'
  };

  constructor() { }

  getValidators(field: keyof typeof this.labels): ValidatorFn[]{
    switch(field){
      case 'nit':
        return [
          Validators.required,
          Validators.pattern(this.patterns.nit),
        ];
      case 'vin':
        return [
          Validators.required,
          Validators.pattern(this.patterns.vin),
          Validators.minLength(17),
          Validators.maxLength(17)
        ];
      case 'fecha':
        return [
          Validators.required,
          this.validarFechaPasada.bind(this)
        ];
      case 'anio':
        return [
          this.validarAnio(1990, 2050)
        ];
      case 'fechares':
        // required lo añadiremos dinámicamente cuando el checkbox esté activo
        return [
          this.validarFechaRescate('fecha').bind(this)
        ];
      default:
        return [];
    }
  }

  getErrorMessages(field: keyof typeof this.labels, control: AbstractControl): string[]{
    if(!control.errors) return[];
    const label = this.labels[field] || field;
    return Object.keys(control.errors).map(errorKey =>
      this.getMensajeError(label, errorKey, control.errors![errorKey])
    );
  }
  private getMensajeError(
    campo: string,
    errorType: string,
    errorValue?: any
  ): string {
    const msgs: Record<string,string> = {
      required:             `${campo} es requerido`,
      minlength:            `${campo} debe tener al menos ${errorValue.requiredLength} caracteres`,
      maxlength:            `${campo} no puede tener más de ${errorValue.requiredLength} caracteres`,
      pattern:              `${campo} tiene un formato inválido`,
      nitInvalido:          `Formato inválido. Ej: 1234-051180-001-2`,
      vinInvalido:          `Formato inválido (17 caracteres alfanumérico sin I, O, Q)`,
      anioInvalido:         `El año está fuera del rango permitido`,
      fechaFutura:          `La fecha no puede ser futura`,
      fechaRescateAnterior: `La fecha de rescate no puede ser anterior a la fecha de ingreso`
    };
    return msgs[errorType] || `Error en ${campo}`;
  }


  // Método nuevo para validar el vehículo completo
  validarVehiculo(vehiculo: any): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];

    // Validación de consignatario
    if (!vehiculo.consignatario) {
      errors.push(this.getMensajeError('Consignatario', 'required'));
    }

    // Validación de NIT
    if (vehiculo.nit) {
      const nitValidation = this.validarNit({ value: vehiculo.nit } as AbstractControl);
      if (nitValidation?.['nitInvalido']) {
        errors.push(this.getMensajeError('NIT', 'nitInvalido'));
      }
    }

    // Validación de fecha
    if (!vehiculo.fecha) {
      errors.push(this.getMensajeError('Fecha', 'required'));
    } else {
      const fechaValidation = this.validarFechaPasada({ value: vehiculo.fecha } as AbstractControl);
      if (fechaValidation?.['fechaFutura']) {
        errors.push(this.getMensajeError('Fecha', 'fechaFutura'));
      }
    }

    // Validación de VIN
    if (!vehiculo.vin) {
      errors.push(this.getMensajeError('VIN', 'required'));
    } else {
      const vinValidation = this.validarVin({ value: vehiculo.vin } as AbstractControl);
      if (vinValidation?.['vinInvalido']) {
        errors.push(this.getMensajeError('VIN', 'vinInvalido'));
      }
    }

    // Validación de fecha de rescate
    if (vehiculo.realizarRescate && !vehiculo.fechares) {
      errors.push(this.getMensajeError('Fecha de rescate', 'required'));
    } else if (vehiculo.fechares && vehiculo.fecha) {
      const fechaRescateValidator = this.validarFechaRescate('fecha');
      const controlRescate = {
        value: vehiculo.fechares,
        parent: {
          get: (name: string) => name === 'fecha' ? { value: vehiculo.fecha } : null
        }
      } as AbstractControl;

      const rescateValidation = fechaRescateValidator(controlRescate);
      if (rescateValidation?.['fechaRescateAnterior']) {
        errors.push(this.getMensajeError('Fecha de rescate', 'fechaRescateAnterior'));
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validarNit(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const nitRegex = /^(\d{8}|\d{7}-\d)$/;
    return nitRegex.test(value) ? null : { nitInvalido: true };
  }

  validarVin(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(value) ? null : { vinInvalido: true };
  }

  validarAnio(minYear: number, maxYear: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (!v) return null;
      const year = v instanceof Date ? v.getFullYear() : +v;
      return year >= minYear && year <= maxYear ? null : { anioInvalido: true };
    };
  }

  validarFechaPasada(control: AbstractControl): ValidationErrors | null {
    const v = control.value;
    if (!v) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    return new Date(v) > today ? { fechaFutura: true } : null;
  }

  validarFechaRescate(fechaControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const ingreso = control.parent.get(fechaControlName)?.value;
      const rescate = control.value;
      if (!ingreso || !rescate) return null;
      return new Date(rescate) >= new Date(ingreso)
        ? null
        : { fechaRescateAnterior: true };
    };
  }
}
