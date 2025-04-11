import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors,ValidatorFn } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ValidacionService {

  constructor() { }

  // Validación para el campo NIT
  validarNit(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const nitRegex = /^(\d{8}|\d{7}-\d)$/;
    return nitRegex.test(value) ? null : { nitInvalido: true };
  }

  // Validación para el campo VIN
  validarVin(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(value) ? null : { vinInvalido: true };
  }

  // Validación para el campo año
  validarAnio(minYear: number, maxYear: number):ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      {
        const value=control.value;
        if(!value) return null;
        return value >= minYear && value

      }
  }

  // Validación para el campo fecha
  validarFechaPasada(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para comparar solo la fecha

    return new Date(value)<= today? null:{fechaFutura:true};
  }

  // validación para el campo fecha de rescate
  validarFechaRescate(fechaControlName: string):ValidatorFn{
    return(control: AbstractControl): ValidationErrors | null =>
      {
      if(!control.parent) return null;

      const fechaIngreso=control.parent.get(fechaControlName)?.value;
      const fechaRescate=control.value;

      if(!fechaIngreso || !fechaRescate) return null;
      return new Date(fechaRescate) >= new Date(fechaIngreso)? null:{fechaRescateAnterior:true};

    };
  }

  //Obtener mensaje de error descriptivo

  getMensajeError(campo: string, errorType: string):string{
    const mensajes: any={
      'required': `${campo} es requerido`,
      'minlength': `${campo} debe tener al menos 3 caracteres`,
      'maxlength': `${campo} no puede tener más de 20 caracteres`,
      'nitInvalido': `Formato de NIT inválido (8 dígitos o 7-1)`,
      'vinInvalido': `Formato de VIN inválido (17 caracteres alfanumérico excluyendo I, O, Q)`,
      'anioInvalido': `El año esta fuera del rango permitido`,
      'fechaFutura': `La fecha no puede ser futura`,
      'fechaRescateAnterior': `La fecha de rescate no puede ser anterior a la fecha de ingreso`,

    };
    return mensajes[errorType] || `Error de validacion en ${campo}`;
  }

}
