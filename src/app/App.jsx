import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import UpdatePrompt from './UpdatePrompt.jsx';
import MedicineList from '../features/medicines/components/MedicineList.jsx';
import SearchInput from '../features/medicines/components/SearchInput.jsx';
import SupplyList from '../features/inventory/components/SupplyList.jsx';
import { normalizeSearchText, searchMedicines, sortMedicinesByName } from '../features/medicines/medicine.utils.js';
import { useInventoryStore } from '../stores/inventory-store.js';

const sections = [
  { id: 'medicines', label: 'Medicamentos' },
  { id: 'supplies', label: 'Insumos' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('medicines');
  const medicines = useInventoryStore((state) => state.medicines);
  const supplies = useInventoryStore((state) => state.supplies);
  const query = useInventoryStore((state) => state.query);
  const setQuery = useInventoryStore((state) => state.setQuery);
  const errors = useInventoryStore((state) => state.errors);
  const loadInventory = useInventoryStore((state) => state.loadInventory);
  const visibleMedicines = useMemo(
    () => sortMedicinesByName(searchMedicines(medicines, query)),
    [medicines, query],
  );
  const visibleSupplies = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return supplies;
    return supplies.filter((item) => (
      normalizeSearchText(`${item.nombre} ${item.notas || ''}`).includes(normalizedQuery)
    ));
  }, [supplies, query]);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  function switchSection(section) {
    setActiveSection(section);
    setQuery('');
  }

  return (
    <main className="app-shell">
      <section id="inicio" className="home-hero" aria-labelledby="home-title">
        <header className="app-header">
          <a className="nav-home-link" href="#inicio">botiquin</a>
          <nav className="nav-actions" aria-label="Navegación principal">
            <a className="nav-add-button" href="#contenido">Consultar inventario</a>
          </nav>
        </header>
        <h1 id="home-title" className="home-title">botiquin</h1>
        <a className="home-cta" href="#contenido">explorar</a>
      </section>

      <section id="contenido" className="inventory-content" aria-label="Inventario doméstico">
        <nav className="inventory-tabs" aria-label="Secciones del inventario">
          {sections.map(({ id, label }) => (
            <Button
              key={id}
              variant={activeSection === id ? 'primary' : 'ghost'}
              aria-pressed={activeSection === id}
              onClick={() => switchSection(id)}
            >
              {label}
            </Button>
          ))}
        </nav>

        {activeSection === 'medicines' ? (
          <section className="inventory grid gap-6" aria-labelledby="inventory-title">
            <SearchInput value={query} onChange={setQuery} />
            <div className="inventory-heading">
              <div>
                <span className="eyebrow">Tu colección doméstica</span>
                <h2 id="inventory-title">Medicamentos</h2>
              </div>
              <span className="eyebrow inventory-count">{medicines.length} {medicines.length === 1 ? 'elemento' : 'elementos'}</span>
            </div>
            {errors.medicines && <p className="text-base text-brand-primary" role="status">{errors.medicines}</p>}
            <MedicineList medicines={visibleMedicines} query={query} onClearSearch={() => setQuery('')} />
          </section>
        ) : (
          <section className="inventory grid gap-6" aria-labelledby="supplies-title">
            <div className="inventory-heading">
              <div>
                <span className="eyebrow">Lo que conviene tener a mano</span>
                <h2 id="supplies-title">Insumos</h2>
              </div>
              <span className="eyebrow inventory-count">{supplies.length} {supplies.length === 1 ? 'elemento' : 'elementos'}</span>
            </div>
            {errors.supplies && <p className="text-base text-brand-primary" role="status">{errors.supplies}</p>}
            <SupplyList supplies={visibleSupplies} query={query} />
          </section>
        )}

        <footer className="app-footer">
          <p className="eyebrow">Mi botiquín · Cuidado de todos los días</p>
        </footer>
      </section>

      <UpdatePrompt />
    </main>
  );
}
