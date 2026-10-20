import { MEDICINE_FORMS } from './medicine.types.js';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCivilDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateMedicine(input) {
  const values = {
    nombre: typeof input?.nombre === 'string' ? input.nombre.trim() : '',
    nombreGenerico: typeof input?.nombreGenerico === 'string' ? input.nombreGenerico.trim() : '',
    dosis: typeof input?.dosis === 'string' ? input.dosis.trim() : '',
    forma: input?.forma,
    cantidad: input?.cantidad,
    vencimiento: input?.vencimiento,
    notas: typeof input?.notas === 'string' ? input.notas.trim() : '',
  };
  const errors = {};

  if (!values.nombre) errors.nombre = 'Ingresá el nombre del medicamento.';
  if (!values.dosis) errors.dosis = 'Ingresá la dosis.';
  if (!MEDICINE_FORMS.includes(values.forma)) errors.forma = 'Elegí una forma válida.';
  if (!Number.isSafeInteger(values.cantidad) || values.cantidad < 0) {
    errors.cantidad = 'La cantidad debe ser un entero igual o mayor a cero.';
  }
  if (!isValidCivilDate(values.vencimiento)) {
    errors.vencimiento = 'Ingresá una fecha válida en formato AAAA-MM-DD.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      ...values,
      nombreGenerico: values.nombreGenerico || undefined,
      notas: values.notas || undefined,
    },
  };
}
