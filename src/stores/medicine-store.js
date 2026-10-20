import { create } from 'zustand';
import { medicineService } from '../features/medicines/medicine.service.js';
import { sortMedicinesByName } from '../features/medicines/medicine.utils.js';

export const useMedicineStore = create((set, get) => ({
  medicines: [],
  query: '',
  status: 'idle',
  error: null,
  hasLoaded: false,

  setQuery(query) {
    set({ query });
  },

  async loadMedicines() {
    set({ status: 'loading', error: null });
    try {
      const medicines = sortMedicinesByName(await medicineService.list());
      set({ medicines, status: 'idle', error: null, hasLoaded: true });
      return medicines;
    } catch {
      set({ status: 'error', error: 'No pudimos leer el inventario. Revisá el almacenamiento de este dispositivo.', hasLoaded: false });
      return [];
    }
  },

  async createMedicine(input) {
    set({ status: 'saving', error: null });
    try {
      const medicine = await medicineService.create(input);
      set({ medicines: sortMedicinesByName([...get().medicines, medicine]), status: 'idle', error: null });
      return medicine;
    } catch (error) {
      set({ status: 'error', error: error.message || 'No pudimos guardar el medicamento.' });
      throw error;
    }
  },

  async updateMedicine(id, input) {
    set({ status: 'saving', error: null });
    try {
      const updated = await medicineService.update(id, input);
      set({
        medicines: sortMedicinesByName(get().medicines.map((medicine) => medicine.id === id ? updated : medicine)),
        status: 'idle',
        error: null,
      });
      return updated;
    } catch (error) {
      set({ status: 'error', error: error.message || 'No pudimos actualizar el medicamento.' });
      throw error;
    }
  },

  async decrementMedicine(id) {
    set({ status: 'saving', error: null });
    try {
      const updated = await medicineService.decrementQuantity(id);
      set({ medicines: get().medicines.map((medicine) => medicine.id === id ? updated : medicine), status: 'idle', error: null });
      return updated;
    } catch (error) {
      set({ status: 'error', error: error.message || 'No pudimos actualizar la cantidad.' });
      throw error;
    }
  },

  async deleteMedicine(id) {
    set({ status: 'saving', error: null });
    try {
      await medicineService.remove(id);
      set({ medicines: get().medicines.filter((medicine) => medicine.id !== id), status: 'idle', error: null });
    } catch (error) {
      set({ status: 'error', error: error.message || 'No pudimos eliminar el medicamento.' });
      throw error;
    }
  },
}));
