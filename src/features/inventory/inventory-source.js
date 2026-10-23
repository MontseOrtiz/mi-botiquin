import { database } from '../../db/database.js';
import { medicinesRepository } from '../../db/medicines.repository.js';
import { parseMedicinesCsv, parseSuppliesCsv } from './inventory-csv.js';

const sources = {
  medicines: { url: import.meta.env.VITE_MEDICINES_CSV_URL, parse: parseMedicinesCsv },
  supplies: { url: import.meta.env.VITE_SUPPLIES_CSV_URL, parse: parseSuppliesCsv },
};

export async function getSnapshot(source) {
  const snapshot = await database.sourceSnapshots.get(source);
  if (snapshot || source !== 'medicines') return snapshot;

  // Preserve the existing local inventory as an offline fallback during migration to Sheets.
  const legacyMedicines = await medicinesRepository.list();
  if (!legacyMedicines.length) return undefined;
  const legacySnapshot = { source, records: legacyMedicines, updatedAt: null, legacy: true };
  await database.sourceSnapshots.put(legacySnapshot);
  return legacySnapshot;
}

export async function refreshSource(source) {
  const config = sources[source];
  if (!config?.url) throw new Error('Falta configurar la URL CSV publicada en el archivo de entorno.');
  const response = await fetch(config.url, {
    cache: 'no-store',
    headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8' },
  });
  if (!response.ok) throw new Error(`La fuente respondió con error (${response.status}).`);
  const records = config.parse(await response.text());
  const snapshot = { source, records, updatedAt: new Date().toISOString() };
  await database.sourceSnapshots.put(snapshot);
  return snapshot;
}
