import { create } from 'zustand';
import { getSnapshot, refreshSource } from '../features/inventory/inventory-source.js';
import { sortMedicinesByName } from '../features/medicines/medicine.utils.js';

function fallbackError(error, hasCache) {
  const reason = error?.message || 'No fue posible actualizar la fuente.';
  return hasCache ? `No se pudo actualizar; se muestra la última copia disponible. ${reason}` : reason;
}

export const useInventoryStore = create((set, get) => ({
  medicines: [],
  supplies: [],
  query: '',
  errors: { medicines: null, supplies: null },
  hasSnapshot: { medicines: false, supplies: false },
  setQuery(query) { set({ query }); },

  async loadInventory() {
    let medicineCache;
    let supplyCache;
    try {
      [medicineCache, supplyCache] = await Promise.all([getSnapshot('medicines'), getSnapshot('supplies')]);
    } catch {
      set({ errors: {
        medicines: 'No pudimos leer la copia local de medicamentos.',
        supplies: 'No pudimos leer la copia local de insumos.',
      } });
      return;
    }
    set({
      medicines: sortMedicinesByName(medicineCache?.records || []),
      supplies: supplyCache?.records || [],
      errors: { medicines: null, supplies: null },
      hasSnapshot: { medicines: Boolean(medicineCache), supplies: Boolean(supplyCache) },
    });

    await Promise.all(['medicines', 'supplies'].map(async (source) => {
      try {
        const snapshot = await refreshSource(source);
        set((state) => ({
          [source]: source === 'medicines' ? sortMedicinesByName(snapshot.records) : snapshot.records,
          errors: { ...state.errors, [source]: null },
          hasSnapshot: { ...state.hasSnapshot, [source]: true },
        }));
      } catch (error) {
        const hasCache = get().hasSnapshot[source];
        set((state) => ({ errors: { ...state.errors, [source]: fallbackError(error, hasCache) } }));
      }
    }));
  },
}));
