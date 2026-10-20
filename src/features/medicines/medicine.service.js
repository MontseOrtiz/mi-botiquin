import { medicinesRepository } from '../../db/medicines.repository.js';
import { validateMedicine } from './medicine.schema.js';

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Este navegador no puede generar un identificador seguro.');
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function assertValid(input) {
  const result = validateMedicine(input);
  if (!result.isValid) {
    const error = new Error('Revisá los datos del medicamento.');
    error.validationErrors = result.errors;
    throw error;
  }
  return result.value;
}

export const medicineService = {
  list() {
    return medicinesRepository.list();
  },

  async create(input) {
    const value = assertValid(input);
    const timestamp = new Date().toISOString();
    const medicine = {
      ...value,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await medicinesRepository.create(medicine);
    return medicine;
  },

  async update(id, input) {
    const value = assertValid(input);
    const timestamp = new Date().toISOString();
    const updated = await medicinesRepository.updateWith(id, (current) => ({
      ...current,
      ...value,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: timestamp,
    }));
    if (!updated) throw new Error('No encontramos ese medicamento en el inventario.');
    return updated;
  },

  async decrementQuantity(id) {
    const timestamp = new Date().toISOString();
    const updated = await medicinesRepository.updateWith(id, (current) => {
      if (current.cantidad <= 0) {
        throw new Error('No hay unidades disponibles para restar.');
      }
      return { ...current, cantidad: current.cantidad - 1, updatedAt: timestamp };
    });
    if (!updated) throw new Error('No encontramos ese medicamento en el inventario.');
    return updated;
  },

  async remove(id) {
    const exists = await medicinesRepository.getById(id);
    if (!exists) return false;
    await medicinesRepository.remove(id);
    return true;
  },
};
