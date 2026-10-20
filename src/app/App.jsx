import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import UpdatePrompt from './UpdatePrompt.jsx';
import MedicineFormDialog from '../features/medicines/components/MedicineFormDialog.jsx';
import MedicineList from '../features/medicines/components/MedicineList.jsx';
import SearchInput from '../features/medicines/components/SearchInput.jsx';
import { searchMedicines } from '../features/medicines/medicine.utils.js';
import { useMedicineStore } from '../stores/medicine-store.js';

export default function App() {
  const medicines = useMedicineStore((state) => state.medicines);
  const query = useMedicineStore((state) => state.query);
  const status = useMedicineStore((state) => state.status);
  const error = useMedicineStore((state) => state.error);
  const hasLoaded = useMedicineStore((state) => state.hasLoaded);
  const loadMedicines = useMedicineStore((state) => state.loadMedicines);
  const setQuery = useMedicineStore((state) => state.setQuery);
  const createMedicine = useMedicineStore((state) => state.createMedicine);
  const updateMedicine = useMedicineStore((state) => state.updateMedicine);
  const deleteMedicine = useMedicineStore((state) => state.deleteMedicine);
  const decrementMedicine = useMedicineStore((state) => state.decrementMedicine);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const visibleMedicines = useMemo(() => searchMedicines(medicines, query), [medicines, query]);

  useEffect(() => { loadMedicines(); }, [loadMedicines]);

  function openNewMedicine() {
    setEditingMedicine(null);
    setFormOpen(true);
  }

  function openEditMedicine(medicine) {
    setEditingMedicine(medicine);
    setFormOpen(true);
  }

  async function saveMedicine(values) {
    if (editingMedicine) await updateMedicine(editingMedicine.id, values);
    else await createMedicine(values);
    setAnnouncement(editingMedicine ? 'Medicamento actualizado.' : 'Medicamento agregado.');
  }

  async function confirmDelete(medicine) {
    if (!window.confirm(`¿Querés eliminar “${medicine.nombre}” del inventario?`)) return;
    try {
      await deleteMedicine(medicine.id);
      setAnnouncement('Medicamento eliminado.');
    } catch {
      setAnnouncement('No pudimos eliminar el medicamento.');
    }
  }

  async function decrement(medicine) {
    try {
      await decrementMedicine(medicine.id);
      setAnnouncement(`Cantidad actualizada: ${medicine.nombre}.`);
    } catch {
      setAnnouncement('No pudimos actualizar la cantidad.');
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header flex justify-between gap-4">
        <p className="app-name">Mi botiquín</p>
        <Button onClick={openNewMedicine}>Agregar medicamento</Button>
      </header>
      <section className="inventory grid gap-6" aria-labelledby="inventory-title">
        <div>
          <h1 id="inventory-title">Mis medicamentos</h1>
          <p>Tu inventario personal, disponible sin conexión.</p>
        </div>
        <SearchInput value={query} onChange={setQuery} />
        {status === 'loading' && <p role="status">Cargando inventario…</p>}
        {error && <p className="text-base text-expiry-red" role="alert">{error}</p>}
        {status !== 'loading' && hasLoaded && (
          <MedicineList
            medicines={visibleMedicines}
            query={query}
            onAdd={openNewMedicine}
            onClearSearch={() => setQuery('')}
            onEdit={openEditMedicine}
            onDelete={confirmDelete}
            onDecrement={decrement}
            busy={status === 'saving'}
          />
        )}
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      </section>
      <UpdatePrompt hasOpenForm={formOpen} />
      <MedicineFormDialog
        open={formOpen}
        medicine={editingMedicine}
        onClose={() => setFormOpen(false)}
        onSave={saveMedicine}
        busy={status === 'saving'}
      />
    </main>
  );
}
