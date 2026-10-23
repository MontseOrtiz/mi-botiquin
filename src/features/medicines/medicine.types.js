/** @typedef {'tableta'|'jarabe'|'crema'|'gotas'|'inhalador'|'otro'} MedicineForm */

/**
 * @typedef {Object} Medicine
 * @property {string} id
 * @property {string} nombre
 * @property {string=} nombreGenerico
 * @property {string} dosis
 * @property {MedicineForm} forma
 * @property {number} cantidad
 * @property {string=} unidad Unidad de conteo (por ejemplo, cajas o piezas).
 * @property {string} vencimiento Fecha civil YYYY-MM-DD.
 * @property {string=} notas
 * @property {string} createdAt ISO timestamp.
 * @property {string} updatedAt ISO timestamp.
 */

export const MEDICINE_FORMS = Object.freeze([
  'tableta',
  'jarabe',
  'crema',
  'gotas',
  'inhalador',
  'otro',
]);
