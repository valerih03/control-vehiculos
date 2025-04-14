import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors,ValidatorFn } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ValidacionService {

  constructor() { }


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
      const value = control.value;
      if (!value) return null;
      return value >= minYear && value <= maxYear ? null : { anioInvalido: true };
    }
  }

  validarFechaPasada(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(value) > today ? { fechaFutura: true } : null;
  }

  validarFechaRescate(fechaControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const fechaIngreso = control.parent.get(fechaControlName)?.value;
      const fechaRescate = control.value;

      if (!fechaIngreso || !fechaRescate) return null;
      return new Date(fechaRescate) >= new Date(fechaIngreso) ? null : { fechaRescateAnterior: true };
    };
  }

  getMensajeError(campo: string, errorType: string): string {
    const mensajes: Record<string, string> = {
      'required': `${campo} es requerido`,
      'minlength': `${campo} debe tener al menos 3 caracteres`,
      'maxlength': `${campo} no puede tener más de 20 caracteres`,
      'nitInvalido': `Formato de NIT inválido (8 dígitos o 7-1)`,
      'vinInvalido': `Formato de VIN inválido (17 caracteres alfanumérico excluyendo I, O, Q)`,
      'anioInvalido': `El año esta fuera del rango permitido`,
      'fechaFutura': `La fecha no puede ser futura`,
      'fechaRescateAnterior': `La fecha de rescate no puede ser anterior a la fecha de ingreso`,
    };
    return mensajes[errorType] || `Error de validación en ${campo}`;
  }

}
